import Jwt  from "jsonwebtoken";
import HttpMethodStatus from "../utility/static.js";

let refreshTokens = []

// register user
export const loginUser = async (req, res) => {
    try {
        const data = req.body
        const accessToken = Jwt.sign(data,process.env.ACCESS_TOKEN_SECRET,{expiresIn: '30s'},)

        const refreshToken = Jwt.sign(data,process.env.REFRESH_TOKEN_SECRET,)
        refreshTokens.push(refreshToken)
        HttpMethodStatus.ok(res, 'Login success', {accessToken, refreshToken } )
      // Create a new user
    //   const newUser = new User({
    //   });
  
      ///Save User
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