import { asyncHandler } from "../utils/asyncHandler.js";
import express, { request } from 'express'
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const registerUser= asyncHandler(async (req,res)=>{
    // res.status(200).json({
    //     message:"Hello!",
    // })

const {fullName,email,username,password} = req.body
console.log("req.body ", req.body);


// condition to check if any of the field is empty.
if(
    [fullName,email,username,password].some((field)=> field?.trim()==="") 
) {
    throw new ApiError(400, "All fields are required")
}

// more validations to be imposed.

const existingUser= await User.findOne({
    $or: [{username},{email}]
});

    if(existingUser) {
        throw new ApiError(409,"The username or email already exists")
    }

    console.log("checking existing user", existingUser);

    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverImage[0]?.path
    console.log("checking req.files",req.files);
    console.log("avatar local path: ", avatarLocalPath)
    if(!avatarLocalPath) {
        throw new ApiError(409,"Avatar not found")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    console.log("avatar Url print",  avatar?.url)
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

const generateAccessAndRefreshTokens = async (userId)=>{
try {
        const user =  await User.findById(userId);
        
        const accessToken=user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
    
        user.refreshToken = refreshToken;
        user.save({validateBeforeCheck: false});
    
        return {accessToken,refreshToken};
    
} catch (error) {
    throw new ApiError(401, "error generating tokens")
}

}
const loginUser = asyncHandler(async(req,res)=>{
// req->body
// username or email 
// find the user
// pass check
// access and refresh token
// send cookie

    const {fullName,username,password}=req.body;

    if(!username || !email) {
        throw new ApiError(400, "Username or email is required");
    
    }

   const user = await User.findById({
        $or:[{username},{email}],
    })

    if(!user) {
        throw new ApiError(400,"user doesnt exists")
    }

    const options = {
        httpOnly: true,
        secure: true
    }

   const isPassValid=await user.isPasswordCorrect(password);

   if(!isPassValid) {
        throw new ApiError(400,"Error because invalid credentials");
   }

   const {accessToken,refreshToken} = await generateAccessAndRefreshTokens(user._id);

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken") ;

   return res.status(200)
    .cookie("AccessToken",accessToken,options)
    .cookie("RefreshToken",refreshToken,options)
    .json(
        new ApiResponse(200,
            {
                user: loggedInUser,accessToken,refreshToken
            },
        ),
        "User LoggedIN Successfully"
    )
    
})

const logoutUser=asyncHandler(async(req,res)=>{
    // we need userID but we can't ask it again and again...
    // so we use a middleware
    
//    const userId=req.user._id

    // const user= await User.findById(req.user._id);

     const options = {
        httpOnly: true,
        secure: true
    }


     await   User.findByIdAndUpdate(
            req.user._id,
            {
                $set:{
                    refreshToken:undefined
                }
            },options
        )

           return res.status(200)
    .clearCookie("AccessToken",options)
    .clearCookie("RefreshToken",options)
    .json(
        new ApiResponse(200,
            {

            },
        ),
        "User loggedOut Successfully"
    )

})

export {registerUser, loginUser, logoutUser};