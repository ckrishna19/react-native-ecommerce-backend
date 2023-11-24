const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;
const mongoose = require("mongoose");
const orderRouter = require("./src/router/orderRouter");
const userRouter = require("./src/router/userRouter");
const auth = require("./src/utils/auth");

require("dotenv").config();
const app = express();
app.use(express.json());
app.use(cors());
app.use(fileUpload({ useTempFiles: true }));
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_ID,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});
// "mongodb://127.0.0.1:27017/stripe"

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("database connected"))
  .catch(() => console.log("Error on connectiong database"));

app.use("/order", auth, orderRouter);

app.use("/user", userRouter);

app.use((err, req, res, next) => {
  if (err) throw Error;
  next();
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`app listen at port ${port}`));
