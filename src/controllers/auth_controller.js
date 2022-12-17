import Jwt  from "jsonwebtoken";
import HttpMethodStatus from "../utility/static.js";
import User from "../models/user.js";

let refreshTokens = []

// register user
export const loginUser = async (req, res) => {
  try {
      const data = req.body
      const accessToken = Jwt.sign(data,process.env.ACCESS_TOKEN_SECRET,{expiresIn: '600s'},)

      const refreshToken = Jwt.sign(data,process.env.REFRESH_TOKEN_SECRET,)
      refreshTokens.push(refreshToken)
    // Create a new user
    
    const isUserExist = await User.findOne({'walletAddress': data.walletAddress.toLowerCase()})
  
    if(isUserExist){
      return HttpMethodStatus.ok(res, 'Login success', {user: isUserExist, accessToken, refreshToken})
    }

    const newUser = new User({
      walletAddress: data.walletAddress.toLowerCase(),
      signature: data.signature,
    });

    ///Save User
    
    await newUser.save((error, user) => {
      HttpMethodStatus.created(res, 'register success!', { user: user, accessToken, refreshToken });
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


export const randomNounce = (req, res) => {
  const len = 5
  let randStr = ''
  for (let i = 0; i < len; i++){
    var ch = Math.floor((Math.random() * 10))
    if(ch === 0){
      ch++
    }
    randStr += ch
  }

  if(randStr.length !== 5){
    return HttpMethodStatus.badRequest(res, 'something Wrong!!')
  }
  return HttpMethodStatus.ok(res, 'random nonce', randStr)
}

