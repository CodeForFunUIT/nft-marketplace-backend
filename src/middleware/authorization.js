import Jwt  from "jsonwebtoken";
import HttpMethodStatus from "../utility/static.js";

export const authToken = (req, res, next) => {
  const authorizationHeader = req.headers['authorization'];
  // Bear [token]
  if(!authorizationHeader){
    return HttpMethodStatus.forbidden(res, 'missing header authorization')
  }
  const token = authorizationHeader.split(' ')[1];
  if(!token) return HttpMethodStatus.unAuthenticated(res, 'un authenticated');

  Jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, data) => {
    if(err) return HttpMethodStatus.forbidden(res, err.message);
    req.userId = data.id;
    next();
  });  
}