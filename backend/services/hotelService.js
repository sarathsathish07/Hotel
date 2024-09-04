
import hotelRepository from '../repositories/hotelRepository.js';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import jwt from "jsonwebtoken";


const generateHotelierToken = (res,userId)=>{
  const token = jwt.sign({userId}, process.env.JWT_SECRET_HOTELIER,{
    expiresIn:"30d",
  })

  res.cookie('jwtHotelier', token, {
    httpOnly: true,
    secure: true,  
    sameSite: 'None',
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: '/'
  });
}

const fetchAcceptedHotels = async (sortOption = '', amenities = [], city = '') => {
  try {
    const sortCriteria = {};
    if (sortOption === 'price_low_high') {
      sortCriteria.averagePrice = 1;
    } else if (sortOption === 'price_high_low') {
      sortCriteria.averagePrice = -1; 
    }

    const filterCriteria = {
      verificationStatus: 'accepted',
      isListed: true,
    };

    if (amenities.length > 0) {
      filterCriteria.amenities = { $all: amenities };
    }

    if (city) {
      filterCriteria.city = city;
    }

    const hotels = await hotelRepository.getAcceptedHotels(sortCriteria, filterCriteria);
    return { status: 'success', data: hotels, message: 'Hotels fetched successfully.' };
  } catch (error) {
    return { status: 'error', data: null, message: error.message };
  }
};

const sendHotelierOtpEmail = async (email, otp) => {
  try {
    let transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'your-email@gmail.com',
        pass: 'your-email-password',
      },
    });

    let mailOptions = {
      from: 'your-email@gmail.com',
      to: email,
      subject: 'OTP Verification',
      text: `Your OTP is: ${otp}`,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw new Error('Failed to send OTP email');
  }
};

const authHotelier = async (email, password) => {
  try {
    const hotelier = await hotelRepository.findHotelierByEmail(email);
    if (hotelier && (await hotelier.matchPassword(password))) {
      if (!hotelier.otpVerified) {
        if (new Date() > hotelier.otpExpiry) {
          return { status: 'error', data: null, message: 'OTP has expired. Please request a new OTP.' };
        }
        return { status: 'error', data: null, message: 'Please verify your OTP before logging in.' };
      }
      return { status: 'success', data: hotelier, message: 'Login successful.' };
    } else {
      return { status: 'error', data: null, message: 'Invalid email or password.' };
    }
  } catch (error) {
    return { status: 'error', data: null, message: error.message };
  }
};

const registerHotelier = async (name, email, password) => {
  try {
    const userExists = await hotelRepository.findHotelierByEmail(email);

    if (userExists && !userExists.otpVerified) {
      await resendOtp(email);
      return { status: 'success', data: userExists, message: 'User already exists but is not verified. OTP has been resent.' };
    } else if (userExists) {
      return { status: 'error', data: null, message: 'User already exists and is verified.' };
    } else {
      const otp = crypto.randomInt(100000, 999999);
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); 

      const user = await hotelRepository.createHotelier({
        name,
        email,
        password,
        otp,
        otpVerified: false,
        otpExpiry,
      });

      await sendHotelierOtpEmail(user.email, otp);
      return { status: 'success', data: user, message: 'User registered successfully.' };
    }
  } catch (error) {
    return { status: 'error', data: null, message: error.message };
  }
};

const verifyHotelierOtp = async (email, otp) => {
  try {
    const hotelier = await hotelRepository.findHotelierByEmail(email);
    if (hotelier) {
      if (new Date() > hotelier.otpExpiry) {
        return { status: 'error', data: null, message: 'OTP has expired.' };
      }

      if (hotelier.otp.toString() === otp.trim()) {
        hotelier.otpVerified = true;
        await hotelRepository.saveHotelier(hotelier);
        return { status: 'success', data: null, message: 'OTP verified successfully.' };
      } else {
        return { status: 'error', data: null, message: 'Invalid OTP.' };
      }
    } else {
      return { status: 'error', data: null, message: 'Hotelier not found.' };
    }
  } catch (error) {
    return { status: 'error', data: null, message: error.message };
  }
};

const resendOtp = async (email) => {
  try {
    const hotelier = await hotelRepository.findHotelierByEmail(email);
    if (!hotelier) {
      throw new Error('Hotelier not found.');
    }

    const otp = crypto.randomInt(100000, 999999);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); 

    hotelier.otp = otp;
    hotelier.otpExpiry = otpExpiry;
    await hotelRepository.saveHotelier(hotelier);
    await sendHotelierOtpEmail(hotelier.email, otp);
  } catch (error) {
    throw new Error('Failed to resend OTP.');
  }
};

const logoutHotelier = async () => {
  try {
    res.cookie('jwtHotelier', '', {
      httpOnly: true,
      expires: new Date(0),
    });
    return { status: 'success', data: null, message: 'Hotelier logged out.' };
  } catch (error) {
    return { status: 'error', data: null, message: error.message };
  }
};

const getHotelierProfile = async (userId) => {
  try {
    const user = await hotelRepository.findHotelierById(userId);
    return { 
      status: 'success', 
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profileImageName: user.profileImageName,
        verificationStatus: user.verificationStatus
      }, 
      message: 'Hotelier profile retrieved successfully.' 
    };
  } catch (error) {
    return { status: 'error', data: null, message: error.message };
  }
};

const updateHotelierProfile = async (hotelierId, updateData, profileImage) => {
  try {
    const hotelier = await hotelRepository.findHotelierById(hotelierId);
    if (!hotelier) {
      return { status: 'error', data: null, message: 'Hotelier not found.' };
    }

    hotelier.name = updateData.name || hotelier.name;
    hotelier.email = updateData.email || hotelier.email;
    if (updateData.password) {
      hotelier.password = updateData.password;
    }
    if (profileImage) {
      hotelier.profileImageName = profileImage.filename || hotelier.profileImageName;
    }

    const updatedHotelier = await hotelRepository.saveHotelier(hotelier);
    return { status: 'success', data: updatedHotelier, message: 'Hotelier profile updated successfully.' };
  } catch (error) {
    return { status: 'error', data: null, message: error.message };
  }
};

const uploadCertificates = async (hotelId, certificatePath) => {
  try {
    const hotel = await hotelRepository.findHotelById(hotelId);
    if (!hotel) {
      return { status: 'error', data: null, message: 'Hotel not found.' };
    }

    hotel.certificate = certificatePath.replace('backend/public/', '');
    hotel.verificationStatus = "pending";
    const updatedHotel = await hotel.save();
    return { status: 'success', data: updatedHotel, message: 'Certificate uploaded successfully.' };
  } catch (error) {
    return { status: 'error', data: null, message: error.message };
  }
};

const addHotel = async (hotelierId, hotelData) => {
  try {
    const createdHotel = await hotelRepository.createHotel(hotelierId, hotelData);
    return { status: 'success', data: createdHotel, message: 'Hotel added successfully.' };
  } catch (error) {
    return { status: 'error', data: null, message: error.message };
  }
};

const getHotels = async (hotelierId) => {
  try {
    const hotels = await hotelRepository.findHotelsByHotelierId(hotelierId);
    return { status: 'success', data: hotels, message: 'Hotels retrieved successfully.' };
  } catch (error) {
    return { status: 'error', data: null, message: error.message };
  }
};

const getHotelById = async (hotelId) => {
  try {
    const hotel = await hotelRepository.findHotelById(hotelId);
    if (!hotel) {
      return { status: 'error', data: null, message: 'Hotel not found.' };
    }

    const rooms = await hotelRepository.findRoomById({ hotelId });

    return { status: 'success', data: { ...hotel._doc, rooms }, message: 'Hotel details retrieved successfully.' };
  } catch (error) {
    return { status: 'error', data: null, message: error.message };
  }
};

const updateHotelData = async (hotelId, updateData, files) => {
  try {
    const hotel = await hotelRepository.findHotelById(hotelId);
    if (!hotel) {
      return { status: 'error', data: null, message: 'Hotel not found.' };
    }

    hotel.name = updateData.name || hotel.name;
    hotel.city = updateData.city || hotel.city;
    hotel.address = updateData.address || hotel.address;
    hotel.description = updateData.description || hotel.description;
    hotel.amenities = updateData.amenities ? updateData.amenities.split(",").map(item => item.trim()) : hotel.amenities;
    hotel.latitude = updateData.latitude || hotel.latitude;
    hotel.longitude = updateData.longitude || hotel.longitude;

    if (files && files.length > 0) {
      const newImages = files.map(file => file.path.replace(/.*public[\\/]/, ""));
      hotel.images.push(...newImages); 
    }

    if (updateData.removeImages && updateData.removeImages.length > 0) {
      hotel.images = hotel.images.filter(image => !updateData.removeImages.includes(image));
    }

    const updatedHotel = await hotel.save();
    return { status: 'success', data: updatedHotel, message: 'Hotel data updated successfully.' };
  } catch (error) {
    return { status: 'error', data: null, message: error.message };
  }
};
const getHotelsWithUnreadMessages = async (hotelierId) => {
  const hotels = await hotelRepository.findHotelsByHotelierId(hotelierId);

  const hotelData = await Promise.all(
    hotels.map(async (hotel) => {
      const unreadMessagesCount = await hotelRepository.countUnreadMessagesForHotels([hotel._id]);

      return {
        ...hotel._doc,
        unreadMessagesCount,
      };
    })
  );

  return hotelData;
};
const getHotelDetailsById = async (hotelId) => {
  const hotel = await hotelRepository.findHotelById(hotelId);
  
  if (!hotel) {
    throw new Error('Hotel not found');
  }

  const rooms = await hotelRepository.findRoomsByHotelId(hotelId);
  const chatRooms = await hotelRepository.findChatRoomsByHotelId(hotelId);
  const chatRoomIds = chatRooms.map(chatRoom => chatRoom._id);
  
  const unreadMessagesCount = await hotelRepository.countUnreadMessagesForChatRooms(chatRoomIds);

  return {
    ...hotel.toObject(),
    rooms,
    unreadMessagesCount,
  };
};
const getHotelierStats = async (hotelierId) => {
  const totalHotels = await hotelRepository.countTotalHotels(hotelierId);
  const totalBookings = await hotelRepository.countTotalBookings(hotelierId);
  const totalRevenue = await hotelRepository.calculateTotalRevenue(hotelierId);
  const monthlyBookings = await hotelRepository.getMonthlyBookings(hotelierId);
  const yearlyBookings = await hotelRepository.getYearlyBookings(hotelierId);

  return {
    totalHotels,
    totalBookings,
    totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].totalAmount : 0,
    monthlyBookings: monthlyBookings.map(({ _id, count }) => ({
      month: `${_id.year}-${_id.month.toString().padStart(2, '0')}`,
      count
    })),
    yearlyBookings: yearlyBookings.map(({ _id, count }) => ({ year: _id.year, count }))
  };
};
const getHotelierSalesReport = async (hotelierId, fromDate, toDate) => {
  return hotelRepository.getSalesReport(hotelierId, fromDate, toDate);
};


export default {
  fetchAcceptedHotels,
  authHotelier,
  registerHotelier,
  verifyHotelierOtp,
  logoutHotelier,
  getHotelierProfile,
  updateHotelierProfile,
  uploadCertificates,
  addHotel,
  getHotels,
  getHotelById,
  updateHotelData,
  resendOtp,
  generateHotelierToken,
  getHotelsWithUnreadMessages,
  getHotelDetailsById,
  getHotelierStats,
  getHotelierSalesReport
};
