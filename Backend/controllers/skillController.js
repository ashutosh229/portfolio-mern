import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import Skill from "../models/skillSchema.js";
import { v2 as cloudinary } from "cloudinary";

export const addNewSkill = catchAsyncErrors(async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler("Please also enter the image for skill", 400));
  }
  const { svg } = req.files;
  const { title, proficiency } = req.body;
  if (!title || !proficiency) {
    return next(
      new ErrorHandler("Please also enter the title and proficiency", 400)
    );
  }
  const cloudinaryResponse = await cloudinary.uploader.upload(
    svg.tempFilePath,
    { folder: "PORTFOLIO SKILL IMAGES" }
  );
  if (!cloudinaryResponse || cloudinaryResponse.error) {
    console.error(
      "Cloudinary Error:",
      cloudinaryResponse.error || "Unknown Cloudinary error"
    );
    return next(
      new ErrorHandler(
        "Failed to upload the image of the skill to cloudinary",
        500
      )
    );
  }
  const skill = await Skill.create({
    title,
    proficiency,
    svg: {
      public_id: cloudinaryResponse.public_id, // Set your cloudinary public_id here
      url: cloudinaryResponse.secure_url, // Set your cloudinary secure_url here
    },
  });
  if (!skill) {
    return next(
      new ErrorHandler("Something went wrong while creating the skill", 500)
    );
  }
  res.status(201).json({
    success: true,
    message: "Skill is successfully created",
    skill: skill,
  });
});

export const deleteSkill = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  let skill = await Skill.findById(id);
  if (!skill) {
    return next(new ErrorHandler("Skill with this ID do not exist", 400));
  }
  const skillSvgId = skill.svg.public_id;
  await cloudinary.uploader.destroy(skillSvgId);
  await skill.deleteOne({
    _id: ObjectId(id),
  });
  res.status(200).json({
    success: true,
    message: "Skill is successfully deleted",
    skillDeleted: skill,
  });
});

export const updateSkill = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  let skill = await Skill.findById(id);
  if (!skill) {
    return next(new ErrorHandler("Skill with this ID do not exist", 400));
  }
  const { proficiency } = req.body;
  skill = await Skill.findByIdAndUpdate(
    id,
    { proficiency },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );
  if (!skill) {
    return next(
      new ErrorHandler("Something went wrong while updating the skill", 500)
    );
  }
  res.status(200).json({
    success: true,
    message: "Skill Updated!",
    updatedSkill: skill,
  });
});

export const getAllSkills = catchAsyncErrors(async (req, res, next) => {
  const skills = await Skill.find();
  if (!skills) {
    return next(
      new ErrorHandler("Something went wrong while fetching the skills", 500)
    );
  }
  res.status(200).json({
    success: true,
    message: "Skills are successfully fetched",
    skills: skills,
  });
});
