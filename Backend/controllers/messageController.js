import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import Message from "../models/messageSchema.js";

export const sendMessage = catchAsyncErrors(async (req, res, next) => {
  const { senderName, subject, message } = req.body;
  if (!senderName || !subject || !message) {
    return next(new ErrorHandler("Please fill all the details properly", 400));
  }
  const data = await Message.create({
    senderName,
    subject,
    message,
  });
  if (!data) {
    return next(
      new ErrorHandler("Something went wrong while sending the message", 500)
    );
  }
  res.status(201).json({
    success: true,
    message: "Message is sent successfully",
    data: data,
  });
});

export const deleteMessage = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const message = await Message.findById(id);
  if (!message) {
    return next(
      new ErrorHandler("Message with the given id do not exist", 400)
    );
  }
  await Message.deleteOne({
    _id: ObjectId(id),
  });
  res.status(201).json({
    success: true,
    message: "Message is deleted successfully",
    deletedMessage: message,
  });
});

export const getAllMessages = catchAsyncErrors(async (req, res, next) => {
  const messages = await Message.find();
  res.status(201).json({
    success: true,
    message: "Messages are successfully fetched",
    messages: messages,
  });
});
