import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { User } from "../models/user.model";


const verifyJWT = asyncHandler(async(req,_,next)=>{
    const token = await req.cookie?.accessToken|| req.header("Authorization").replace("Bearer ", "");    
    if(!token) {
        throw new ApiError(400,"token not found");
    }

    const decodedToken= jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
  
    const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

    req.user=user;
    next();

})

export {verifyJWT}