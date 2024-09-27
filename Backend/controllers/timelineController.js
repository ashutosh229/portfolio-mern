import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import Timeline from "../models/timelineSchema.js";

export const postTimeline = catchAsyncErrors(async (req, res, next) => {
  const { title, description, from, to } = req.body;
  if (!title || !description || !from || !to) {
    return next(
      new ErrorHandler("Please enter the title and description", 400)
    );
  }
  const newTimeline = await Timeline.create({
    title,
    description,
    timeline: { from, to },
  });
  if (!newTimeline) {
    return next(
      new ErrorHandler("Something went wrong while creating the timeline", 500)
    );
  }
  res.status(200).json({
    success: true,
    message: "Timeline has been successfully created",
    newTimeline: newTimeline,
  });
});

export const deleteTimeline = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  let timeline = await Timeline.findById(id);
  if (!timeline) {
    return next(new ErrorHandler("Timeline with this ID do not exist", 400));
  }
  await timeline.deleteOne({ _id: ObjectId(id) });
  res.status(200).json({
    success: true,
    message: "Timeline is successfully deleted",
    deletedTimeline: timeline,
  });
});

export const getAllTimelines = catchAsyncErrors(async (req, res, next) => {
  const timelines = await Timeline.find();
  if (!timelines) {
    return next(
      new ErrorHandler("Something went wrong while finding the timelines", 500)
    );
  }
  res.status(200).json({
    success: true,
    message: "Timelines have been successfully fetched",
    timelines: timelines,
  });
});
