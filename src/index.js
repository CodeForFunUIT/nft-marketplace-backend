import express from "express";
import http from "http";
import connectDB from "./db/mongoose.js";
import dotenv from "dotenv";
import Jwt  from "jsonwebtoken";
dotenv.config({path: './config/config.env'})
const app = express();

const server = http.createServer(app);
app.use(express.json({ limit: "50mb", extended: true }));

connectDB();

const books = [
  {
    id: 1,
    name: 'chi ',
    author: 'ABC'
  },
  {
    id: 2,
    name: 'chi1',
    author: 'ABC1'
  },
]
function authToken(req,res,next){
  const authorizationHeader = req.headers['authorization'];
  // Bear [token]
  const token = authorizationHeader.split(' ')[1];
  if(!token) res.sendStatus(401);

  Jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, data) => {
    console.log(err, data);
    if(err) res.sendStatus(403);
    next();
  });

}

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

  app.get('/books',authToken, (req, res) => {
    res.json({status: 'Success', data: books})
  })
  
  // app.post('/login', (req, res) => {
  //   const data = req.body
  //   const accessToken = Jwt.sign(data,process.env.ACCESS_TOKEN_SECRET,{expiresIn: '30s'},)
  //   res.json({accessToken})
  // })

  const port = process.env.PORT || 5000
  server.listen(port, () => {
    console.log(`Server API listening at http://localhost:${port}`);
  });