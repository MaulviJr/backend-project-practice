import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/likes.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"

const getChannelStats = asyncHandler(async (req, res) => {
    const userId = req.user?._id;

    const stats = await User.aggregate([
        {
            // 1. Target the specific user
            $match: {
                _id: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            // 2. Join with Subscriptions to count subscribers
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            // 3. Join with Videos to calculate counts and views
            $lookup: {
                from: "videos",
                localField: "_id",
                foreignField: "owner",
                as: "videos"
            }
        },
        // {
        //     // 4. Join with Likes (This finds all likes where the video belongs to this owner)
        //     $lookup: {
        //         from: "likes",
        //         localField: "_id",
        //         foreignField: "likedBy", // Note: This finds likes GIVEN by the user. 
        //         // To find likes RECEIVED on their videos, you'd need to match against video IDs.
        //         as: "likedByMe" 
        //     }
        // },
        {
            // 5. Calculate stats using $addFields
            $addFields: {
                subscribersCount: { $size: "$subscribers" },
                videosCount: { $size: "$videos" },
                totalViews: {
                    $sum: "$videos.views" // Directly sums the 'views' field from every object in the 'videos' array
                }
            }
        },
        {
            // 6. Project only the final numbers for a clean response
            $project: {
                username: 1,
                fullName: 1,
                subscribersCount: 1,
                videosCount: 1,
                totalViews: 1
            }
        }
    ]);

    // total likes incomplete

    if (!stats) {
        throw new ApiError(500, "Stats could not be calculated");
    }

    return res.status(200).json(
        new ApiResponse(200, stats[0], "Channel stats fetched successfully")
    );
});

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel

    const userId = req.usr?._id;

    const Videos = await Video.find({
        owner: userId
    });

    if(Videos.length===0) {
        throw new ApiError(404,"The Videos not exists")
    }

    return res.status(200).
    json(
        new ApiResponse(200,
            Videos,
            "The Videos were fetched Successfully!"
        )
    )
})

export {
    getChannelStats, 
    getChannelVideos
    }