import crypto from 'crypto';
import nodemailer from 'nodemailer';
import * as userRepository from '../repositories/userRepository.js';
import jwt from 'jsonwebtoken';

const generateToken = (res, userId) => {
  try {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: '/',
    });
    return { status: 'success', data: { token }, message: 'Token generated and cookie set.' };
  } catch (error) {
    return { status: 'error', data: null, message: error.message };
  }
};

const sendOtpEmail = async (email, otp) => {
  try {
    let transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'sarathsathish77@gmail.com',
        pass: 'pehs ltsj iktw pqtp',
      },
    });

    let mailOptions = {
      from: 'sarathsathish77@gmail.com',
      to: email,
      subject: 'OTP Verification',
      text: `Your OTP is: ${otp}`,
    };

    await transporter.sendMail(mailOptions);
    return { status: 'success', data: null, message: 'OTP email sent successfully.' };
  } catch (error) {
    return { status: 'error', data: null, message: error.message };
  }
};

const authenticateUser = async (email, password) => {
  try {
    const user = await userRepository.findUserByEmail(email);

    if (user && (await user.matchPassword(password))) {
      if (user.isBlocked) {
        return { status: 'error', data: null, message: 'User is blocked' };
      }
      if (!user.otpVerified) {
        if (new Date() > user.otpExpiry) {
          return { status: 'error', data: null, message: 'OTP has expired. Please request a new OTP.' };
        }
        return { status: 'error', data: null, message: 'Please verify your OTP before logging in' };
      }
      return { status: 'success', data: user, message: 'User authenticated successfully' };
    } else {
      return { status: 'error', data: null, message: 'Invalid email or password' };
    }
  } catch (error) {
    return { status: 'error', data: null, message: error.message };
  }
};

const registerNewUser = async (name, email, password) => {
  try {
    const userExists = await userRepository.findUserByEmail(email);

    if (userExists && !userExists.otpVerified) {
      await resendOtp(email);
      return { status: 'success', data: userExists, message: 'User already exists but is not verified. OTP has been resent.' };
    } else if (userExists) {
      return { status: 'error', data: null, message: 'User already exists and is verified.' };
    } else {
      const otp = crypto.randomInt(100000, 999999);
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000); 
      const user = await userRepository.createUser({
        name,
        email,
        password,
        otp,
        otpExpires,
        otpVerified: false,
      });

      await sendOtpEmail(user.email, otp);
      return { status: 'success', data: user, message: 'User registered successfully' };
    }
  } catch (error) {
    return { status: 'error', data: null, message: error.message };
  }
};

const verifyUserOtp = async (email, otp) => {
  try {
    const user = await userRepository.findUserByEmail(email);

    if (user && user.otp.toString() === otp.trim()) {
      if (user.otpExpires && user.otpExpires < Date.now()) {
        return { status: 'error', data: null, message: 'OTP has expired' };
      }
      user.otpVerified = true;
      await userRepository.saveUser(user);
      return { status: 'success', data: null, message: 'OTP verified successfully' };
    } else {
      return { status: 'error', data: null, message: 'Invalid OTP' };
    }
  } catch (error) {
    return { status: 'error', data: null, message: error.message };
  }
};

const resendOtp = async (email) => {
  try {
    const user = await userRepository.findUserByEmail(email);

    if (!user) {
      return { status: 'error', data: null, message: 'User not found' };
    }

    const otp = crypto.randomInt(100000, 999999);
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); 
    await userRepository.saveUser(user);
    await sendOtpEmail(user.email, otp);

    return { status: 'success', data: null, message: 'OTP resent successfully' };
  } catch (error) {
    return { status: 'error', data: null, message: error.message };
  }
};

const logoutUser = (res) => {
  try {
    res.cookie('jwt', '', {
      httpOnly: true,
      expires: new Date(0),
    });
    return { status: 'success', data: null, message: 'User logged out' };
  } catch (error) {
    return { status: 'error', data: null, message: error.message };
  }
};

const getUserProfile = async (userId) => {
  try {
    const user = await userRepository.findUserById(userId);
    return {
      status: 'success',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profileImageName: user.profileImageName
      },
      message: 'User profile retrieved successfully'
    };
  } catch (error) {
    return { status: 'error', data: null, message: error.message };
  }
};

const updateUserProfileService = async (userId, updateData, profileImage) => {
  try {
    const user = await userRepository.findUserById(userId);
    if (!user) {
      return { status: 'error', data: null, message: 'User not found' };
    }

    if (updateData.currentPassword) {
      const isMatch = await user.matchPassword(updateData.currentPassword);
      if (!isMatch) {
        return { status: 'error', data: null, message: 'Current password is incorrect' };
      }
    }

    user.name = updateData.name || user.name;
    user.email = updateData.email || user.email;
    if (updateData.password) {
      user.password = updateData.password;
    }
    if (profileImage) {
      user.profileImageName = profileImage.filename || user.profileImageName;
    }

    await userRepository.saveUser(user);
    return { status: 'success', data: user, message: 'User profile updated successfully' };
  } catch (error) {
    return { status: 'error', data: null, message: error.message };
  }
};

const getSingleHotelById = async (id) => {
  try {
    const hotel = await userRepository.findHotelById(id);
    if (hotel) {
      const rooms = await userRepository.findRoomsByHotelId(id);
      return { status: 'success', data: { ...hotel._doc, rooms }, message: 'Hotel retrieved successfully' };
    }
    return { status: 'error', data: null, message: 'Hotel not found' };
  } catch (error) {
    return { status: 'error', data: null, message: error.message };
  }
};

const sendEmail = async ({ to, subject, text }) => {
  try {
    let transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'sarathsathish77@gmail.com',
        pass: 'pehs ltsj iktw pqtp',
      },
    });

    let mailOptions = {
      from: 'sarathsathish77@gmail.com',
      to: to,
      subject: subject,
      text: text,
    };

    await transporter.sendMail(mailOptions);
    return { status: 'success', data: null, message: 'Email sent successfully' };
  } catch (error) {
    return { status: 'error', data: null, message: error.message };
  }
};

const sendPasswordResetEmailService = async (email) => {
  try {
    const user = await userRepository.findUserByEmail(email);

    if (!user) {
      return { status: 'error', data: null, message: 'User not found' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpire = Date.now() + 30 * 60 * 1000; 

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = resetTokenExpire;
    await userRepository.saveUser(user);

    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;

    const message = `
      You requested a password reset. Please make a PUT request to:
      ${resetUrl}
    `;

    await sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      text: message,
    });

    return { status: 'success', data: null, message: 'Password reset email sent' };
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await userRepository.saveUser(user);
    return { status: 'error', data: null, message: 'Email could not be sent' };
  }
};

const resetPasswordService = async (resetToken, password) => {
  try {
    const user = await userRepository.findUserByResetToken(resetToken);

    if (!user) {
      return { status: 'error', data: null, message: 'Invalid or expired token' };
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await userRepository.saveUser(user);

    return { status: 'success', data: null, message: 'Password reset successfully' };
  } catch (error) {
    return { status: 'error', data: null, message: error.message };
  }
};

export {
  authenticateUser,
  registerNewUser,
  verifyUserOtp,
  logoutUser,
  getUserProfile,
  updateUserProfileService,
  generateToken,
  resendOtp,
  getSingleHotelById,
  sendPasswordResetEmailService,
  resetPasswordService
};
