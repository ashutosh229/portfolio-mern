import { isValidObjectId } from "mongoose";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import Project from "../models/projectSchema.js";
import { v2 as cloudinary } from "cloudinary";

export const addNewProject = catchAsyncErrors(async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler("Project Banner Image is required", 404));
  }

  const projectBanner = req.files;
  const {
    title,
    description,
    gitRepoLink,
    projectLink,
    stack,
    technologies,
    deployed,
  } = req.body;
  if (
    !title ||
    !description ||
    !gitRepoLink ||
    !projectLink ||
    !stack ||
    !technologies ||
    !deployed
  ) {
    return next(new ErrorHandler("Please Provide All Details!", 400));
  }

  const cloudinaryResponse = await cloudinary.uploader.upload(
    projectBanner.tempFilePath,
    { folder: "PORTFOLIO PROJECT IMAGES" }
  );
  if (!cloudinaryResponse || cloudinaryResponse.error) {
    console.error(
      "Cloudinary Error:",
      cloudinaryResponse.error || "Unknown Cloudinary error"
    );
    return next(new ErrorHandler("Failed to upload avatar to Cloudinary", 500));
  }

  const project = await Project.create({
    title,
    description,
    gitRepoLink,
    projectLink,
    stack,
    technologies,
    deployed,
    projectBanner: {
      public_id: cloudinaryResponse.public_id, // Set your cloudinary public_id here
      url: cloudinaryResponse.secure_url, // Set your cloudinary secure_url here
    },
  });

  if (!project) {
    return next(
      new ErrorHandler("Something went wrong while creating the project", 500)
    );
  }

  res.status(201).json({
    success: true,
    message: "Project has been created successfully",
    project: project,
  });
});

export const updateProject = catchAsyncErrors(async (req, res, next) => {
  const newProjectData = {
    title: req.body.title,
    description: req.body.description,
    stack: req.body.stack,
    technologies: req.body.technologies,
    deployed: req.body.deployed,
    projectLink: req.body.projectLink,
    gitRepoLink: req.body.gitRepoLink,
  };
  if (req.files && req.files.projectBanner) {
    const projectBanner = req.files.projectBanner;
    const project = await Project.findById(req.params.id);
    if (!project) {
      return next(new ErrorHandler("Project with this ID do not exist", 400));
    }
    const projectImageId = project.projectBanner.public_id;
    await cloudinary.uploader.destroy(projectImageId);
    const newProjectImage = await cloudinary.uploader.upload(
      projectBanner.tempFilePath,
      {
        folder: "PORTFOLIO PROJECT IMAGES",
      }
    );
    if (!newProjectImage || newProjectImage.error) {
      console.error(
        "Cloudinary Error:",
        newProjectImage.error || "Unknown Cloudinary error"
      );
      return next(
        new ErrorHandler(
          "Failed to upload the updated image to cloudinary",
          500
        )
      );
    }
    newProjectData.projectBanner = {
      public_id: newProjectImage.public_id,
      url: newProjectImage.secure_url,
    };
  }
  const id = req.params.id;
  const project = await Project.findById(id);
  if (!project) {
    return next(new ErrorHandler("Project with this ID do not exist", 400));
  }
  const projectUpdated = await Project.findByIdAndUpdate(id, newProjectData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  if (!projectUpdated) {
    return next(
      new ErrorHandler("Something went wrong while modifying the project", 500)
    );
  }
  res.status(200).json({
    success: true,
    message: "Project is updated successfully",
    updatedProject: projectUpdated,
  });
});

export const deleteProject = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  const project = await Project.findById(id);
  if (!project) {
    return next(new ErrorHandler("Project with this ID do not exist", 400));
  }
  const projectImageId = project.projectBanner.public_id;
  await cloudinary.uploader.destroy(projectImageId);
  await Project.deleteOne({
    _id: ObjectId(id),
  });
  res.status(200).json({
    success: true,
    message: "Project is deleted successfully",
    deletedProject: project,
  });
});

export const getAllProjects = catchAsyncErrors(async (req, res, next) => {
  const projects = await Project.find();
  if (!projects) {
    return next(
      new ErrorHandler("Something went wrong while fetching the projects", 500)
    );
  }
  res.status(200).json({
    success: true,
    message: "Projects are fetched successfully",
    projects: projects,
  });
});

export const getSingleProject = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  try {
    const project = await Project.findById(id);
    if (!project) {
      return next(new ErrorHandler("Project with this ID do not exist"));
    }
    res.status(200).json({
      success: true,
      message: `Project with the ID: ${id} is successfully fetched`,
      project: project,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Something went wrong",
      error: error,
    });
  }
});
