import crypto from "crypto";
import nodemailer from "nodemailer";
import * as userRepository from "../repositories/userRepository.js";
import jwt from "jsonwebtoken";
import responseMessages from "../constants/responseMessages.js";

const generateToken = (res, userId) => {
  try {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: "/",
    });
    return {
      status: "success",
      data: { token },
      message: responseMessages.TOKEN_GENERATED,
    };
  } catch (error) {
    return { status: "error", data: null, message: error.message };
  }
};

const sendOtpEmail = async (email, otp) => {
  try {
    let transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: "sarathsathish77@gmail.com",
        pass: "pehs ltsj iktw pqtp",
      },
    });

    let mailOptions = {
      from: "sarathsathish77@gmail.com",
      to: email,
      subject: "OTP Verification",
      text: `Your OTP is: ${otp}`,
    };

    await transporter.sendMail(mailOptions);
    return {
      status: "success",
      data: null,
      message: responseMessages.OTP_EMAIL_SENT,
    };
  } catch (error) {
    return { status: "error", data: null, message: error.message };
  }
};

const authenticateUser = async (email, password) => {
  try {
    const user = await userRepository.findUserByEmail(email);

    if (user && (await user.matchPassword(password))) {
      if (user.isBlocked) {
        return {
          status: "error",
          data: null,
          message: responseMessages.USER_BLOCKED,
        };
      }
      if (!user.otpVerified) {
        if (new Date() > user.otpExpiry) {
          return {
            status: "error",
            data: null,
            message: responseMessages.OTP_EXPIRED,
          };
        }
        return {
          status: "error",
          data: null,
          message: responseMessages.OTP_NOT_VERIFIED,
        };
      }
      return {
        status: "success",
        data: user,
        message: responseMessages.USER_AUTHENTICATED,
      };
    } else {
      return {
        status: "error",
        data: null,
        message: responseMessages.INVALID_EMAIL_OR_PASSWORD,
      };
    }
  } catch (error) {
    return { status: "error", data: null, message: error.message };
  }
};

const registerNewUser = async (name, email, password) => {
  try {
    const userExists = await userRepository.findUserByEmail(email);

    if (userExists && !userExists.otpVerified) {
      await resendOtp(email);
      return {
        status: "success",
        data: userExists,
        message: responseMessages.USER_ALREADY_EXISTS_UNVERIFIED,
      };
    } else if (userExists) {
      return {
        status: "error",
        data: null,
        message: responseMessages.USER_ALREADY_EXISTS_VERIFIED,
      };
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
      return {
        status: "success",
        data: user,
        message: responseMessages.USER_REGISTERED,
      };
    }
  } catch (error) {
    return { status: "error", data: null, message: error.message };
  }
};

const verifyUserOtp = async (email, otp) => {
  try {
    const user = await userRepository.findUserByEmail(email);

    if (user && user.otp.toString() === otp.trim()) {
      if (user.otpExpires && user.otpExpires < Date.now()) {
        return {
          status: "error",
          data: null,
          message: responseMessages.OTP_EXPIRED,
        };
      }
      user.otpVerified = true;
      await userRepository.saveUser(user);
      return {
        status: "success",
        data: null,
        message: responseMessages.OTP_INVALID,
      };
    } else {
      return {
        status: "error",
        data: null,
        message: responseMessages.OTP_INVALID,
      };
    }
  } catch (error) {
    return { status: "error", data: null, message: error.message };
  }
};

const resendOtp = async (email) => {
  try {
    const user = await userRepository.findUserByEmail(email);

    if (!user) {
      return {
        status: "error",
        data: null,
        message: responseMessages.USER_NOT_FOUND,
      };
    }

    const otp = crypto.randomInt(100000, 999999);
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await userRepository.saveUser(user);
    await sendOtpEmail(user.email, otp);

    return {
      status: "success",
      data: null,
      message: responseMessages.OTP_RESENT,
    };
  } catch (error) {
    return { status: "error", data: null, message: error.message };
  }
};

const logoutUser = (res) => {
  try {
    res.cookie("jwt", "", {
      httpOnly: true,
      expires: new Date(0),
    });
    return {
      status: "success",
      data: null,
      message: responseMessages.PROFILE_UPDATED,
    };
  } catch (error) {
    return { status: "error", data: null, message: error.message };
  }
};

const getUserProfile = async (userId) => {
  try {
    const user = await userRepository.findUserById(userId);
    return {
      status: "success",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profileImageName: user.profileImageName,
      },
      message: responseMessages.PROFILE_UPDATED,
    };
  } catch (error) {
    return { status: "error", data: null, message: error.message };
  }
};

const updateUserProfileService = async (userId, updateData, profileImage) => {
  try {
    const user = await userRepository.findUserById(userId);
    if (!user) {
      return {
        status: "error",
        data: null,
        message: responseMessages.USER_NOT_FOUND,
      };
    }

    if (updateData.currentPassword) {
      const isMatch = await user.matchPassword(updateData.currentPassword);
      if (!isMatch) {
        return {
          status: "error",
          data: null,
          message: responseMessages.CURRENT_PASSWORD_INCORRECT,
        };
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
    return {
      status: "success",
      data: user,
      message: responseMessages.PROFILE_UPDATED,
    };
  } catch (error) {
    return { status: "error", data: null, message: error.message };
  }
};

const getSingleHotelById = async (id) => {
  try {
    const hotel = await hotelRepository.findHotelById(id);
    return {
      status: "success",
      data: hotel,
      message: responseMessages.HOTEL_RETRIEVED,
    };
  } catch (error) {
    return { status: "error", data: null, message: error.message };
  }
};
const sendPasswordResetEmailService = async (email) => {
  try {
    const user = await userRepository.findUserByEmail(email);

    if (!user) {
      return { status: "error", data: null, message: "User not found" };
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpire = Date.now() + 30 * 60 * 1000;

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = resetTokenExpire;
    await userRepository.saveUser(user);

    const resetUrl = `https://celebrate-spaces.vercel.app/reset-password/${resetToken}`;

    const message = `You requested a password reset. Please make a request to:
      ${resetUrl}`;
    await sendEmail({
      to: user.email,
      subject: "Password Reset Request",
      text: message,
    });

    return {
      status: "success",
      data: null,
      message: "Password reset email sent",
    };
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await userRepository.saveUser(user);
    return { status: "error", data: null, message: "Email could not be sent" };
  }
};

const resetPasswordService = async (resetToken, password) => {
  try {
    const user = await userRepository.findUserByResetToken(resetToken);

    if (!user) {
      return {
        status: "error",
        data: null,
        message: "Invalid or expired token",
      };
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await userRepository.saveUser(user);

    return {
      status: "success",
      data: null,
      message: "Password reset successfully",
    };
  } catch (error) {
    return { status: "error", data: null, message: error.message };
  }
};

export default {
  generateToken,
  sendOtpEmail,
  authenticateUser,
  registerNewUser,
  verifyUserOtp,
  resendOtp,
  logoutUser,
  getUserProfile,
  updateUserProfileService,
  getSingleHotelById,
  resetPasswordService,
  sendPasswordResetEmailService,
};
