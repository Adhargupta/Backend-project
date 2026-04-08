import {User} from '../model/user.model.js'
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";


export const verifyJWT = asyncHandler(async(req,res, next)=>{                       // in middleware we uses req. res. next

try {
    // -------------------------------- Getting Access Token --------------------------------------- //
    
        const token = req.cookies?.accessToken || req.header(                                         // Firstly we are checking if access token is present in cookies or in header
    
            "Authorization"                                                            // (Authorization is the standard header for sending access token in header)
    
        )?.replace("Bearer ", "")                                                      // if access token is present in header then we are removing "Bearer " from it cause we only need the token part
        if(!token){
            throw new ApiError(401, "Unauthorized request")
        }
    
    // -------------------------------- Verifying Token is ours? --------------------------------------- //
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)                         // we verify token created is by us (as every token we created has ACCESS_TOKEN_SECRET)
    
    // -------------------------------- getting user --------------------------------------- //
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
        if(!user){
            throw new ApiError(401, "Invalid access token")
        }
    
        req.user = user                                             // Storing it in req.user so that we can access it in next middleware or controller
        next()                                                                      // if everything is fine then we move to next step to give access for looutUser function in user.controller.js
} catch (error) {
    throw new ApiError(401, error?.message || "Unauthorized token")
}
})      