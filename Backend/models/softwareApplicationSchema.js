import mongoose from "mongoose";

const softwareApplicationSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  svg: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
});

const SoftwareApplication = mongoose.model(
  "SoftwareApplication",
  softwareApplicationSchema
);
export default SoftwareApplication;
