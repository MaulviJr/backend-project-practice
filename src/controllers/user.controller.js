import { asyncHandler } from "../utils/asyncHandler.js";
import express, { request } from 'express'
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser= asyncHandler(async (req,res)=>{
    res.status(200).json({
        message:"Hello!",
    })

const {fullName,email,username,password} = req.body
console.log("email", email);


// condition to check if any of the field is empty.
if(
    [fullName,email,username,password].some((field)=> field?.trim()==="") 
) {
    throw new ApiError(400, "All fields are required")
}

// more validations to be imposed.

const existingUser=User.findOne({
    $or: [{username},{email}]
});

    if(existingUser) {
        throw new ApiError(409,"The username or email already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverImage[0]?.path
    console.log(req.files);

    if(!avatarLocalPath) {
        throw new ApiError(409,"Avatar not found")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar) {
        throw new ApiError(400,"Avatar is missing");
    }

   const user = await User.create({
        fullName,
        avatar:avatar.url,
        email,
        username: username.toLowerCase(),
        coverImage:coverImage?.url || "",
        password,
    })

    // checking if user has been made

    // user will be found and its password and refresh token is excluded 
    //by using select.
   const createdUser= await User.findById(user._id).select(
    "-password -refreshToken"
   )

if(!createdUser) {
    throw new ApiError(400,"User has not made")
}
    return res.status(201).json(
        new ApiResponse(200,createdUser,"User registered successfully")
    )

});




export {registerUser};