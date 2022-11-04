import express from "express";
import http from "http";
import connectDB from "../db/mongoose.js";
import dotenv from "dotenv";
import Jwt  from "jsonwebtoken";
dotenv.config({path: './config/config.env'})
const app = express();

const server = http.createServer(app);
app.use(express.json({ limit: "50mb", extended: true }));

connectDB();

let refreshTokens = []

  app.post('/refreshToken', (req, res) =>{
    const refreshToken = req.body.token;
    if(!refreshToken) res.sendStatus(401);
    if(!refreshTokens.includes(refreshToken)) res.sendStatus(403)
    Jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, data) => {
      console.log(err, data);
      if(err) res.sendStatus(403)
      const accessToken = Jwt.sign({data}, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '30s'
      });
      res.json({accessToken})
    });
  })

  app.post('/login', (req, res) => {
    const data = req.body
    const accessToken = Jwt.sign(data,process.env.ACCESS_TOKEN_SECRET,{expiresIn: '30s'},)
    
    const refreshToken = Jwt.sign(data,process.env.REFRESH_TOKEN_SECRET,)
    refreshTokens.push(refreshToken)
    res.json({accessToken, refreshToken })
  })

  app.post('/logout',(req, res) =>{
    const refreshToken = req.body.token;
    refreshTokens = refreshTokens.filter(refToken => refToken !== refreshToken)
    res.sendStatus(200)
  })
  const port = 3500
  server.listen(port, () => {
    console.log(`Server API listening at http://localhost:${port}`);
  });