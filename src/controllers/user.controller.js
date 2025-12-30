import { asyncHandler } from "../utils/asyncHandler.js";
import express, { request } from 'express'
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt, { decode } from 'jsonwebtoken'
import mongoose from "mongoose";

const registerUser = asyncHandler(async (req, res) => {
    // res.status(200).json({
    //     message:"Hello!",
    // })

    const { fullName, email, username, password } = req.body
    console.log("req.body ", req.body);


    // condition to check if any of the field is empty.
    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    // more validations to be imposed.

    const existingUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (existingUser) {
        throw new ApiError(409, "The username or email already exists")
    }

    console.log("checking existing user", existingUser);
    console.log("req.files: ", req.files);
    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverImage[0]?.path
    console.log("checking req.files", req.files);
    console.log("avatar local path: ", avatarLocalPath)
    if (!avatarLocalPath) {
        throw new ApiError(409, "Avatar not found")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    console.log("avatar Url print", avatar?.url)
    if (!avatar) {
        throw new ApiError(400, "Avatar is missing");
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        email,
        username: username.toLowerCase(),
        coverImage: coverImage?.url || "",
        password,
    })

    // checking if user has been made

    // user will be found and its password and refresh token is excluded 
    //by using select.
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(400, "User has not made")
    }
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )

});

const generateAccessAndRefreshTokens = async (userId) => {
    try {
    
        const user = await User.findById(userId);
        
        const accessToken =  user.generateAccessToken();
        const refreshToken =  user.generateRefreshToken();
     
        

        user.refreshToken = refreshToken;
        user.save({ validateBeforeCheck: false });

        return { accessToken, refreshToken };

    } catch (error) {
        throw new ApiError(401, error?.message)
    }

}
const loginUser = asyncHandler(async (req, res) => {
    // req->body
    // username or email 
    // find the user
    // pass check
    // access and refresh token
    // send cookie

    const { fullName, username, password, email } = req.body;

    if (!(username || email)) {
        throw new ApiError(400, "Username or email is required");

    }

    const user = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (!user) {
        throw new ApiError(400, "user doesnt exists")
    }

    const options = {
        httpOnly: true,
        secure: true
    }

    const isPassValid = await user.isPasswordCorrect(password);
    console.log("password", password);
    if (!isPassValid) {
        throw new ApiError(400, "Error because invalid credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    return res.status(200)
        .cookie("AccessToken", accessToken, options)
        .cookie("RefreshToken", refreshToken, options)
        .json(
            new ApiResponse(200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
            ),
            "User LoggedIN Successfully"
        )

})

const logoutUser = asyncHandler(async (req, res) => {
    // we need userID but we can't ask it again and again...
    // so we use a middleware

    //    const userId=req.user._id

    // const user= await User.findById(req.user._id);

    const options = {
        httpOnly: true,
        secure: true
    }


    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        }, options
    )

    return res.status(200)
        .clearCookie("AccessToken", options)
        .clearCookie("RefreshToken", options)
        .json(
            new ApiResponse(200,
                {

                },
            ),
            "User loggedOut Successfully"
        )

})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = await req.cookies?.RefreshToken
    // console.log("req.cookies: ", req.cookies)

    if (!incomingRefreshToken) {
        throw new ApiError(401, "token not found");
    }

    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

    if (!decodedToken) {
        throw new ApiError(401, "Token coudln't verify")
    }

    const user = await User.findById(decodedToken?._id);

    if (!user) {
        throw new ApiError("user unauthorized");
    }
    //generate new referesh token

    const options = {
        httpOnly: true,
        secure: true
    }
    
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)
   
    return res.status(200)
        .cookie("AccessToken", accessToken, options)
        .cookie("RefreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    accessToken,
                    refreshToken: refreshToken
                },
                "AccessToken Refreshed"
            )
        )


})

const changeUserPassword = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)

    const { oldPassword, newPassword } = req.body;

    const isPasswordCorrect = user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Password incorrect");
    }
    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res.status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Password Updated Successfully"
            )
        );

})

const getCurrentUser = asyncHandler(async (req, res) => {
    
    return res.status(200).json(
        new ApiResponse (
            200, req.user, "Current user fetch successfully"
        )
        )


})

const updateUserDetails = asyncHandler(async (req, res) => {
    // const user=await User.findById(req.user._id)

    const { fullName, email, username } = req.body;

    if (!fullName || !email || !username) {
        throw new ApiError(400, "Atleast one field from Fullname, email or username should be filled");
    }

    const user = await User.findByIdAndUpdate(req.user._id,
        {
            $set: {
                fullName: fullName,
                email: email,
                username: username,
            }
        },
        { new: true }
    )

    return res.status(200)
        .json(
            new ApiResponse(
                200,
                user,
                "User details updated"
            )
        )


})

const updateAvatar = asyncHandler(async (req, res) => {
    // delete old image


    const avatarfilePath = req.file?.path
    if (!avatarfilePath) {
        throw new ApiError(400, "Avatar file path ain't found")
    }
    const avatar = await uploadOnCloudinary(avatarfilePath);

    if (!avatar) {
        throw new ApiError(400, "Avatar was not found");
    }

    await User.findByIdAndUpdate(req?.user._id
        , {
            $set: {
                avatar: avatar.url
            }

        },
        { new: true }
    );

    return res.status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Avatar was updated"
            )
        )

})

const updateCoverImage = asyncHandler(async (req, res) => {



    const coverfilePath = req.file?.path
    if (!coverfilePath) {
        throw new ApiError(400, "CoverImage file path ain't found")
    }
    const coverImage = await uploadOnCloudinary(coverfilePath);

    if (!coverImage) {
        throw new ApiError(400, "coverImage was not found");
    }

    await User.findByIdAndUpdate(req?.user._id
        , {
            $set: {
                coverImage: coverImage.url
            }

        },
        { new: true }
    );

    return res.status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "coverImage was updated"
            )
        )

})

const getChannelDetails = asyncHandler(async (req, res) => {

    const { username } = req.params

    //sir used req.params

    if (username?.trim() === "") {
        throw new ApiError(404, "user not found")
    }
    // const user = await User.find(username)

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }

        }, {
            $lookup: {
                from: "Subscription",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "Subscription",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount:
                {
                    $size: "$subscribers"
                },
                subscribedToCount:
                {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: {
                            $in: [req.user?._id, "$subscribers.subscriber"]
                        },
                        then: true,
                        else: false
                    }
                }
            }
        }, {

            $project: {
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                subscribedToCount: 1,
                isSubscribed:1,
                avatar: 1,
                coverImage: 1,
            }

        }
    ])

    console.log("channel type: ", channel);

    return res.status(200)
        .json(
            new ApiResponse(
                200,
                channel[0],
                "user fetched successfully"
            )
        )
})

const getWatchHistory = asyncHandler(async (req, res) => {



    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user?._id)
            }

        },

        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]

                        }
                    }, {
                        $set: {
                            owner: { $arrayElemAt: ["$owner", 0] } // Another way to say $first
                        }
                    }
                ]
            }
        }
    ])
  return res.status(200)
        .json(
            new ApiResponse(
                200,
                user[0].watchHistory,
                "Watch history fetched successfuly"
            )
        )

})

export {

    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeUserPassword,
    updateUserDetails,
    updateAvatar,
    updateCoverImage,
    getCurrentUser,
    getChannelDetails,
    getWatchHistory
};