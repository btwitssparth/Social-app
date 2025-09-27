import Post from "../models/Post.models.js"
import { asyncHandler } from "../utils/asynchandler.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { ApiError } from "../utils/apiError.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { verifyJwt } from "../middlewares/Auth.js"

const createPost= asyncHandler(async(req,res)=>{
    const {caption}= req.body;
    
    const imagePath =req.files?.Image?.[0]?.path
    if(!imagePath){
        throw new ApiError(400,"Image is required")

    }

    const image= await uploadOnCloudinary(imagePath)
    if(!image){
        throw new ApiError(500,"Something went wrong while uploading image on cloudinary")

    }
    const post = await Post.create({
        caption,
        image:image.url,
        user: req.user._id
    })

    if(!post){
        throw new ApiError(500,"Error while creating a post")
    }

    return res
    .status(201)
    .json(new ApiResponse(201,post,"Post created successfully"))
})

//get all posts on feed

const getAllPosts= asyncHandler(async(req,res)=>{
    const posts= await Post.find()
    .populate("user","username profilePic")
    .populate("comments.user","username profilePic")
   

    return res.status(200).json(new ApiResponse(201,posts,"All posts fetched successfully"))
})

// Like/unlike a post

const toggleLikePost= asyncHandler(async(req,res)=>{
    const post = await Post.findById(req.params.id);
    if(!post){
        throw new ApiError(404,"Post not found")

    }
    const userId= req.user._id;
    if(post.likes.includes(userId)){
        post.likes.pull(userId)//unlike
    }
    else{
        post.likes.push(userId)//like
    }

    await post.save();

    return res.status(200).json(
        new ApiResponse(200,post,"Post like toggled successfully")
    )
})

// Add comment to a post

const addComment= asyncHandler(async(req,res)=>{
    const {text}= req.body;
    if (!text) {
        throw new ApiError(400, "Comment text is required");
    }
    const post = await Post.findById(req.params.id);
    if(!post){
        throw new ApiError(404,"Post not found")   
    }
    post.comments.push({user:req.user._id,text});
    await post.save();

    await post.populate("comments.user","username profilePic");

    return res.status(200).json(
        new ApiResponse(200,post,"Comment added successfully")
    )
})

export {createPost,getAllPosts,toggleLikePost,addComment};