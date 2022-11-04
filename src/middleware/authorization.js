import Jwt  from "jsonwebtoken";

export const authToken = (req, res, next) => {
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