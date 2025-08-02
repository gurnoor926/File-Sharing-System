import jwt from "jsonwebtoken";
import  env, { configDotenv } from "dotenv";
env.config();
const JWT_Secret = process.env.JWT_SECRET;
function authenticateToken(req,res,next){
  const token = req.headers.authorization?.split(' ')[1];
  if(!token){
    return res.status(401).json({message:"Unauthorized"})
  }
  jwt.verify(token,JWT_Secret,(err,user)=>{
    if(err){
      return res.status(403).json({message:"Forbidden"})
    }
    req.user = user;
     next();
  })
}
export default authenticateToken;