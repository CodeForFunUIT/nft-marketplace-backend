import Jwt  from "jsonwebtoken";
import HttpMethodStatus from "../utility/static.js";
import User from "../models/user.js";

let refreshTokens = []

// register user
export const loginUser = async (req, res) => {
  try {
      const data = req.body
      const accessToken = Jwt.sign(data,process.env.ACCESS_TOKEN_SECRET,{expiresIn: '30s'},)

      const refreshToken = Jwt.sign(data,process.env.REFRESH_TOKEN_SECRET,)
      refreshTokens.push(refreshToken)
    // Create a new user

    const isUserExist = await User.findOne({'walletAddress': data.walletAddress})
  
    if(isUserExist){
      return HttpMethodStatus.ok(res, 'Login success', {data, accessToken, refreshToken})
    }

    const newUser = await new User({
      address: data.walletAddress,
      signature: data.signature,
      nonce: data.nonce,
    });

    ///Save User
    await newUser.save((error, data) => {
      HttpMethodStatus.created(res, 'register success!', { data, accessToken, refreshToken });
    });
    
  } catch (error) {
    console.log(error);
    HttpMethodStatus.internalServerError(res, error.message)
  }
};

export const logOut = (req, res) => {
    const refreshToken = req.body.token;
    refreshTokens = refreshTokens.filter(refToken => refToken !== refreshToken)
    res.sendStatus(200)
}

export const refreshToken = (req, res) => {
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
}

