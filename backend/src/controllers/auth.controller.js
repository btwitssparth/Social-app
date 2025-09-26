import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/apiError";
import { asyncHandler } from "../utils/asynchandler";
import User from "../models/User.model.js";
import { verifyJwt } from "../middlewares/Auth.js";
import { ApiResponse } from "../utils/apiResponse.js";
const generateAccessAndRefreshToken= async(userId)=>{
    try{

        const user= await User.findById(userId)
        const accessToken= user.generateAccessToken()
        const refreshToken= user.generateRefreshToken()

        user.refreshToken=refreshToken;
        await user.save({validateBeforeSave:false})

        return {accessToken,refreshToken}
}
    catch(error){
        console.log(error)
        throw new ApiError(500,"Something went wrong while generating tokens")

    }
}

const registeruser= asyncHandler(async(req,res)=>{
    const {username,email,password}= req.body;

    if(!username || !email || !password){
        throw new ApiError(400,"All fields are required")

    }

    const existedUser= await User.findOne({
        $or:[{email},{username}]
    })

    if(existedUser){
        throw new ApiError(409,"User already exists with this email or username")

    }
    const user = await User.create({
        username:username.toLowerCase(),
        email,
        password

    })

    const createdUser= await User.findById(user._id).select("-password -refreshToken")

    if (!createdUser) {
        throw new ApiError(500,"Something went wrong while creating user")
    }
    return res.status(201).json(
    new ApiResponse(200, createdUser, "User created successfully")
);

})