const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const orderRouter = require("./src/router/orderRouter");
const userRouter = require("./src/router/userRouter");
const auth = require("./src/utils/auth");
require("dotenv").config();
const app = express();
app.use(express.json());
app.use(cors());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("database connected"))
  .catch(() => console.log("Error on connectiong database"));

app.use("/order", auth, orderRouter);

app.use("/user", userRouter);

app.use((err, req, res, next) => {
  if (err) throw Error;
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`app listen at port ${port}`));
