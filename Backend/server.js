import app from "./app.js";
import cloudinary from "cloudinary";

const cloudinaryConfig = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
};
cloudinary.v2.config(cloudinaryConfig);

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server is running at port ${port}`);
});
