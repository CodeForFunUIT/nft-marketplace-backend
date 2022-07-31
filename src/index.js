import express from "express";
import http from "http";
import connectDB from "./db/mongoose.js";
import dotenv from "dotenv";
// import socket from "socket.io"
const app = express();
// socket.createServer(app)

const server = http.createServer(app);
app.use(express.json({ limit: "50mb", extended: true }));

dotenv.config()

connectDB();

//#region setup routes

//#endregion

app.use((req, res, next) => {
    const error = new Error("NOT FOUND!");
    error.status = 403;
    next(error);
  });
  
  // app.use((error, req, res, next) => {
  //   res.status(error.status || 500);
  //   res.send({
  //     msg: "INVALID DATA!",
  //     detail: error.message,
  //   });
  // });
  app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.send({
      msg: "xin cái tuổi",
      detail: '2k1',
    });
  });
  // 172.16.2.112
  const port = process.env.PORT
  server.listen(port, () => {
    console.log(`Server API listening at http://localhost:${port}`);
  });