import express from "express";
import http from "http";
import connectDB from "./db/mongoose.js";
import dotenv from "dotenv";
import authRouter from "./routers/auth_router.js"
import Jwt  from "jsonwebtoken";
import {authToken} from "./middleware/authorization.js";
import cors from "cors";
dotenv.config({path: './config/config.env'})
const app = express();

const server = http.createServer(app);
app.use(express.json({ limit: "50mb", extended: true }));
app.use(cors({
  origin: 'https://nft-marketplace-backend-z4eu.vercel.app',
  methods: ['GET','POST','DELETE','UPDATE','PUT','PATCH'],

}));

connectDB();



// app.use((req, res, next) => {
//     const error = new Error("NOT FOUND!");
//     error.status = 403;
//     next(error);
//   });
  
  // app.use((error, req, res, next) => {
  //   res.status(error.status || 500);
  //   res.send({
  //     msg: "INVALID DATA!",
  //     detail: error.message,
  //   });
  // });
  // app.use((error, req, res, next) => {
  //   res.status(error.status || 500);
  //   res.send({
  //     msg: "xin cái 123456576",
  //     detail: '2k1',
  //   });
  // });
  app.use("/auth",authRouter)

  app.get('/books',authToken, (req, res) => {
    res.json({status: 'Success', data: books})
  })

  app.get('/',(req, res) => {
    res.send('hello')
  })
  

  const port = process.env.PORT || 5000
  server.listen(port, () => {
    console.log(`Server API listening at http://localhost:${port}`);
  });