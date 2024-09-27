import mongoose from "mongoose";

const dbConnection = () => {
  mongoose
    .connect(process.env.MONGO_URI, {
      dbName: "PORTFOLIO",
    })
    .then(() => {
      console.log("Connected successfully to the database");
    })
    .catch((error) => {
      console.log(
        `Some error occured while connecting with the database: ${error}`
      );
    });
};

export default dbConnection;
