import mongoose from "mongoose";

const databaseConnection = async () => {
  try {
    const { connection } = await mongoose.connect(process.env.MONGO_URI, {
      dbName: "aeonaxy",
    });
    console.log(`Database Connection Established on ${connection.host}`);
  } catch (error) {
    console.log(error);
  }
};

export default databaseConnection;
