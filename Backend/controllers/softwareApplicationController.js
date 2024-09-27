import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import SoftwareApplication from "../models/softwareApplicationSchema.js";
import { v2 as cloudinary } from "cloudinary";

export const addNewApplication = catchAsyncErrors(async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(
      new ErrorHandler(
        "Please also enter the Software Application Icon/Image",
        400
      )
    );
  }
  const { svg } = req.files;
  const { name } = req.body;
  if (!name) {
    return next(
      new ErrorHandler("Please also enter the Software's Name!", 400)
    );
  }
  const cloudinaryResponse = await cloudinary.uploader.upload(
    svg.tempFilePath,
    { folder: "PORTFOLIO SOFTWARE APPLICATION IMAGES" }
  );
  if (!cloudinaryResponse || cloudinaryResponse.error) {
    console.error(
      "Cloudinary Error:",
      cloudinaryResponse.error || "Unknown Cloudinary error"
    );
    return next(
      new ErrorHandler(
        "Failed to upload the image of the software application into cloudinary",
        500
      )
    );
  }
  const softwareApplication = await SoftwareApplication.create({
    name,
    svg: {
      public_id: cloudinaryResponse.public_id, // Set your cloudinary public_id here
      url: cloudinaryResponse.secure_url, // Set your cloudinary secure_url here
    },
  });
  if (!softwareApplication) {
    return next(
      new ErrorHandler(
        "Something went wrong while creating the software application",
        500
      )
    );
  }
  res.status(201).json({
    success: true,
    message: "Software application is successfully created",
    softwareApplication: softwareApplication,
  });
});

export const deleteApplication = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  let softwareApplication = await SoftwareApplication.findById(id);
  if (!softwareApplication) {
    return next(
      new ErrorHandler("Software Application with this ID do not exist", 400)
    );
  }
  const softwareApplicationSvgId = softwareApplication.svg.public_id;
  await cloudinary.uploader.destroy(softwareApplicationSvgId);
  await softwareApplication.deleteOne({ _id: ObjectId(id) });
  res.status(200).json({
    success: true,
    message: "Software application is successfully deleted",
    deletedSoftwareApplication: softwareApplication,
  });
});

export const getAllApplications = catchAsyncErrors(async (req, res, next) => {
  const softwareApplications = await SoftwareApplication.find();
  if (!softwareApplications) {
    return next(
      new ErrorHandler(
        "Something went wrong while fetching the software applications",
        500
      )
    );
  }
  res.status(200).json({
    success: true,
    message: "Software applications are successfully fetched",
    softwareApplications: softwareApplications,
  });
});
