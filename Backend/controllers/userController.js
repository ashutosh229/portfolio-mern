import { v2 as cloudinary } from "cloudinary";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import User from "../models/userSchema.js";
import ErrorHandler from "../middlewares/error.js";
import generateToken from "../utils/jwtToken.js";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";

export const register = catchAsyncErrors(async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length <= 1) {
    return next(
      new ErrorHandler("Please enter the avatar and resume also", 400)
    );
  }
  const { avatar, resume } = req.files;

  const cloudinaryResponseForAvatar = await cloudinary.uploader.upload(
    avatar.tempFilePath,
    { folder: "PORTFOLIO AVATAR" }
  );
  if (!cloudinaryResponseForAvatar || cloudinaryResponseForAvatar.error) {
    console.error(
      "Cloudinary Error:",
      cloudinaryResponseForAvatar.error || "Unknown Cloudinary error"
    );
    return next(
      new ErrorHandler(
        "Something went wrong while uploading the avatar into cloudinary",
        500
      )
    );
  }

  const cloudinaryResponseForResume = await cloudinary.uploader.upload(
    resume.tempFilePath,
    { folder: "PORTFOLIO RESUME" }
  );
  if (!cloudinaryResponseForResume || cloudinaryResponseForResume.error) {
    console.error(
      "Cloudinary Error:",
      cloudinaryResponseForResume.error || "Unknown Cloudinary error"
    );
    return next(
      new ErrorHandler(
        "Something went wrong while uploading the resume into cloudinary",
        500
      )
    );
  }

  const {
    fullName,
    email,
    phone,
    aboutMe,
    password,
    portfolioURL,
    githubURL,
    instagramURL,
    twitterURL,
    facebookURL,
    linkedInURL,
  } = req.body;
  if (!fullname || !email || !phone || !aboutme || !password || !portfolioURL) {
    return next(new ErrorHandler("Please enter all the details properly", 400));
  }

  const user = await User.create({
    fullName,
    email,
    phone,
    aboutMe,
    password,
    portfolioURL,
    githubURL,
    instagramURL,
    twitterURL,
    facebookURL,
    linkedInURL,
    avatar: {
      public_id: cloudinaryResponse.public_id, // Set your cloudinary public_id here
      url: cloudinaryResponse.secure_url, // Set your cloudinary secure_url here
    },
    resume: {
      public_id: cloudinaryResponse.public_id, // Set your cloudinary public_id here
      url: cloudinaryResponse.secure_url, // Set your cloudinary secure_url here
    },
  });
  if (!user) {
    return next(
      new ErrorHandler("Something went wrong while creating the user", 500)
    );
  }
  generateToken(user, "User have been successfully registered", 200, res);
});

export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ErrorHandler("Please enter the email and password", 400));
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid email or password", 400));
  }
  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid password!", 400));
  }
  generateToken(user, "User is successfully logged in", 200, res);
});

export const logout = catchAsyncErrors(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", "", {
      httpOnly: true,
      expires: new Date(Date.now()),
    })
    .json({
      success: true,
      message: "User is successfully logged out",
    });
});

export const getUser = catchAsyncErrors(async (req, res, next) => {
  const id = req.user.id;
  const user = await User.findById(id);
  if (!user) {
    return next(new ErrorHandler("User with this ID do not exist", 400));
  }
  res.status(200).json({
    success: true,
    message: "User with the ID is successfully fetched",
    user: user,
  });
});

export const updateProfile = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    fullName: req.body.fullName,
    email: req.body.email,
    phone: req.body.phone,
    aboutMe: req.body.aboutMe,
    githubURL: req.body.githubURL,
    instagramURL: req.body.instagramURL,
    portfolioURL: req.body.portfolioURL,
    facebookURL: req.body.facebookURL,
    twitterURL: req.body.twitterURL,
    linkedInURL: req.body.linkedInURL,
  };
  if (req.files && req.files.avatar) {
    const avatar = req.files.avatar;
    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new ErrorHandler("User with this ID do not exist", 400));
    }
    const profileImageId = user.avatar.public_id;
    await cloudinary.uploader.destroy(profileImageId);
    const newProfileImage = await cloudinary.uploader.upload(
      avatar.tempFilePath,
      {
        folder: "PORTFOLIO AVATAR",
      }
    );
    if (!newProfileImage || newProfileImage.error) {
      console.error(
        "Cloudinary Error: ",
        newProfileImage.error || "Unknown Cloudinary Error"
      );
      return next(
        new ErrorHandler(
          "Something went wrong while uploading the avatar into cloudinary",
          500
        )
      );
    }
    newUserData.avatar = {
      public_id: newProfileImage.public_id,
      url: newProfileImage.secure_url,
    };
  }

  if (req.files && req.files.resume) {
    const resume = req.files.resume;
    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new ErrorHandler("User with this ID do not exist", 400));
    }
    const resumeFileId = user.resume.public_id;
    await cloudinary.uploader.destroy(resumeFileId);
    const newResume = await cloudinary.uploader.upload(resume.tempFilePath, {
      folder: "PORTFOLIO RESUME",
    });
    if (!newResume || newResume.error) {
      console.log(
        "Cloudinary Error: ",
        newResume.error || "Unknown Cloudinary Error"
      );
      return next(
        new ErrorHandler(
          "Something went wrong while uploading the resume into the cloudinary",
          500
        )
      );
    }
    newUserData.resume = {
      public_id: newResume.public_id,
      url: newResume.secure_url,
    };
  }

  const id = req.user.id;
  const user = User.findById(id);
  if (!user) {
    return next(new ErrorHandler("User with this ID do not exist", 400));
  }
  const userUpdated = await User.findByIdAndUpdate(id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  if (!userUpdated) {
    return next(
      new ErrorHandler("Something went wrong while updating the user", 500)
    );
  }
  res.status(200).json({
    success: true,
    message: "User is updated successfully",
    updatedUser: userUpdated,
  });
});

export const updatePassword = catchAsyncErrors(async (req, res, next) => {
  const { currentPassword, newPassword, confirmNewPassword } = req.body;
  if (!currentPassword || !newPassword || !confirmNewPassword) {
    return next(new ErrorHandler("Please enter the details properly", 500));
  }
  const user = await User.findById(req.user.id).select("+password");
  if (!user) {
    return next(new ErrorHandler("User with this ID do not exist", 400));
  }
  const isPasswordMatched = await user.comparePassword(currentPassword);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Incorrect Current Password!", 500));
  }
  if (currentPassword === newPassword) {
    return next(ErrorHandler("Old and new password must be different", 400));
  }
  if (newPassword !== confirmNewPassword) {
    return next(
      new ErrorHandler("New Password And Its Confirmation Do Not Match!")
    );
  }
  user.password = newPassword;
  await user.save();
  res.status(200).json({
    success: true,
    message: "Password is successfully updated",
    updatedPassword: user.password,
  });
});

export const getUserForPortfolio = catchAsyncErrors(async (req, res, next) => {
  const id = req.user.id;
  const user = await User.findById(id);
  if (!user) {
    return next(new ErrorHandler("User with this ID do not exist", 400));
  }
  res.status(200).json({
    success: true,
    message: "User is successfully fetched",
    user: user,
  });
});

export const forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return next(new ErrorHandler("Please enter your email properly", 400));
  }
  const user = await User.findOne({ email: email });
  if (!user) {
    return next(new ErrorHandler("User with the email is not found", 400));
  }
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${process.env.DASHBOARD_URL}/password/reset/${resetToken}`;
  const message = `Your Reset Password Token is:- \n\n ${resetPasswordUrl}  \n\n If 
  You've not requested this email then, please ignore it.`;

  try {
    await sendEmail({
      email: user.email,
      subject: `Personal Portfolio Dashboard Password Recovery`,
      message: message,
    });
    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler(error.message, 500));
  }
});

export const resetPassword = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.params;
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    return next(
      new ErrorHandler(
        "Reset password token is invalid or has been expired.",
        400
      )
    );
  }
  if (user.password === req.body.password) {
    return next(
      new ErrorHandler("Old and new password must be different", 400)
    );
  }
  if (req.body.password !== req.body.confirmPassword) {
    return next(
      new ErrorHandler("Password & Confirm Password do not match", 400)
    );
  }
  user.password = await req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  generateToken(user, "Password is successfully reset", 200, res);
});
