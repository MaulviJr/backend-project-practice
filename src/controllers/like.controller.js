import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/likes.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    // 1. Check if the like already exists for THIS user
    const existingLike = await Like.findOne({
        video: videoId,
        likedBy: req.user?._id // Match the specific user
    });

    if (existingLike) {
        // 2. If it exists, delete the record (Unlike)
        await Like.findByIdAndDelete(existingLike._id);

        return res.status(200).json(
            new ApiResponse(200, {}, "The Video was Unliked Successfully")
        );
    }

    // 3. If it doesn't exist, create it (Like)
    const newLike = await Like.create({
        video: videoId,
        likedBy: req.user?._id // Use the field name from your schema
    });

    if (!newLike) {
        throw new ApiError(500, "There was some error in liking the video");
    }

    return res.status(200).json(
        new ApiResponse(200, newLike, "The Video was Liked Successfully")
    );
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
  const existingLike = await Like.findOne({
        comment: commentId,
        likedBy: req.user?._id // Match the specific user
    });

    if (existingLike) {
        // 2. If it exists, delete the record (Unlike)
        await Like.findByIdAndDelete(existingLike._id);

        return res.status(200).json(
            new ApiResponse(200, {}, "The comment was Unliked Successfully")
        );
    }

    // 3. If it doesn't exist, create it (Like)
    const newLike = await Like.create({
        comment: commentId,
        likedBy: req.user?._id // Use the field name from your schema
    });

    if (!newLike) {
        throw new ApiError(500, "There was some error in liking the comment");
    }

    return res.status(200).json(
        new ApiResponse(200, newLike, "The comment was Liked Successfully")
    );
});




const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    const existingLike = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user?._id // Match the specific user
    });

    if (existingLike) {
        // 2. If it exists, delete the record (Unlike)
        await Like.findByIdAndDelete(existingLike._id);

        return res.status(200).json(
            new ApiResponse(200, {}, "The tweet was Unliked Successfully")
        );
    }

    // 3. If it doesn't exist, create it (Like)
    const newLike = await Like.create({
        tweet: tweetId,
        likedBy: req.user?._id // Use the field name from your schema
    });

    if (!newLike) {
        throw new ApiError(500, "There was some error in liking the tweet");
    }

    return res.status(200).json(
        new ApiResponse(200, newLike, "The tweet was Liked Successfully")
    );
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos

        const likedVideos = await Like.find({});
        
        if(!likedVideos) {
            throw new ApiError(400,"Couldn't fetch the videos");
        }

        res.status(200).
        json(
            new ApiResponse(200,
                likedVideos,
                "The Liked Videos fetched Successfully"
            )
        )
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}