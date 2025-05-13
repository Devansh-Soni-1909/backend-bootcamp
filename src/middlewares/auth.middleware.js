import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, _ ,next)=>{ // we write underscore because we did'nt use res
    try {
        

        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");

        // console.log(token);
        if(!token){
            throw new ApiError(401,"unauthorized request ")
        }
    
        const decodedToken = jwt.verify(token,process.env.ACCESS_SECRET_TOKEN)
    
        const user = await User.findById(decodedToken._id).select("-password -refreshToken")
    
        if(!user){
            
            throw new ApiError(401,"invalid access token")
        }
    
        req.user = user;
        next() // move to next middleware or route
    } catch (error) {

        throw new ApiError(401,error?.message || "invalid access token")
        
    }



})

