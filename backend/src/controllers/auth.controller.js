import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asynchandler.js";
import User from "../models/User.model.js";
import { verifyJwt } from "../middlewares/Auth.js";
import { ApiResponse } from "../utils/apiResponse.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"
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

    const profilePicPath= req.files?.profilePic?.[0]?.path
    if(!profilePicPath){
        throw new ApiError(400,"Profile picture is required")
    }
    
    const profilePic = await uploadOnCloudinary(profilePicPath)

    if(!profilePic){
        throw new ApiError(500,"Something went wrong while uploading profile picture")

    }
    const user = await User.create({
        username:username.toLowerCase(),
        email,
        password,
        profilePic:profilePic.url


    })

   

    // for auto login

    const {accessToken,refreshToken}= await generateAccessAndRefreshToken(user._id)

    const createdUser= await User.findById(user._id).select("-password -refeshtoken")

    if(!createdUser) throw new ApiError(500,"Something went wrong while creating user")

        const options={
            httpOnly:true,
            secure:process.env.NODE_ENV==="production",
            sameSite:"strict",
        }
    return res
    .status(201)
    .cookie("accesstoken",accessToken,options )
    .cookie("refreshtoken",refreshToken,options)
    .json(new ApiResponse(201,{
        user:createdUser,
        accessToken,
        refreshToken,

    },"User registered and logged in Successfully"))

})


const loginuser= asyncHandler(async(req,res)=>{
    const {email,password}= req.body;
    
    if ([email,password].some((field)=>field?.trim()==="")) {
        throw new ApiError(400,"Please fill all the fields")    
    }

    const user= await User.findOne({email});
    if (!user) {
        throw new ApiError(401,"Invalid credentials")
    }

    const isPasswordValid= await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401,"Invalid Password")
    }

    const {accessToken,refreshToken}= await generateAccessAndRefreshToken(user._id)

    const loggedIn= await User.findById(user._id).select("-password -refreshtoken")
    
    const options={
        httpOnly:true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(new ApiResponse(200,{
        user:loggedIn,
        accessToken,
        refreshToken
    },
    "User logged in successfully"))

})

const logoutuser= asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,{
            $unset:{
                refreshtoken:1
            }
        },{
            new:true
        })

    const options={
        httpOnly:true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,null,"User logged out successfully"))
})

const getcurrentuser= asyncHandler(async(req,res)=>{
    return res
    .status(200)
    .json(
        new ApiResponse(200,req.user,"Current user fetched successfully")
    )
})
export {registeruser,loginuser,logoutuser, getcurrentuser};