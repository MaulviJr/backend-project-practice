import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { deleteOnCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoById = asyncHandler(async (req, res) => {
    // get video id,
    // make db call, Video.findById(videoId);
    // once gotten it then display response.

    const { videoId } = req.params;

    const videofetched = await Video.findById(videoId);

    if (!videofetched) {
        throw new ApiError(400, "Can't fetch video");
    }

    return res.status(200)
        .json(
            new ApiResponse(
                200,
                videofetched,
                "Video was fetched successfully"
            )
        )


})

const publishAVideo = asyncHandler(async (req, res) => {
    // get video title description from req.body
    // get file path from req.file
    // upload to cloudinary.
    // calculate duration
    // grab the owner of the video
    // save that all to DB through Video.create

    const { title, description } = req.body
   

    const user = await User.findById(req.user?._id);
    // console.log(req);
    const thumbnailLocalFilePath = req.files?.thumbnail[0]?.path;
    const videoLocalFilePath = req.files?.videoFile[0]?.path;
    
    // console.log("thumbnailFileCheck: ", thumbnailLocalFilePath)
    // console.log("videoFileCheck: ", videoLocalFilePath)
    if (!thumbnailLocalFilePath) {
        throw new ApiError(400, "Thumbnail path not found");
    }
    if (!videoLocalFilePath) {
        throw new ApiError(400, "Video path not found");
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalFilePath);
    const video = await uploadOnCloudinary(videoLocalFilePath);

    if (!thumbnail) {
        throw new ApiError(400, "Can't upload thumbnail");
    }
    if (!video) {
        throw new ApiError(400, "Can't upload video");
    }
    const uploadedVideo = await Video.create(
        {

            title,
            description,
            thumbnail: thumbnail.url,
            videoFile: video.url,
            duration: video.duration,
            owner: req.user?.id
        }

    )
    if (!uploadedVideo) {
        throw new ApiError(401, "Video not uploaded");
    }

    return res.status(200)
        .json(
            new ApiResponse(200,
                uploadedVideo,
                "Video Uploaded Successfully."
            )
        )


})

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination

    const pipeline = [];

    if (userId) {
        pipeline.push({
            $match: {
                owner: new mongoose.Schema.Types.ObjectId(userId)
            },
        })
    }

    if (query) {
        pipeline.push({
            $match: {
                $or: [
                    { title: { $regex: query, $options: "i" } },
                    { description: { $regex: query, $options: "i" } },
                ]
            },
        })
    }

    const sortField = sortBy || "createdAt";
    const sortingType = sortType === "desc" ? -1 : 1;

    pipeline.push({
        $sort: {
            [sortField]: sortingType
        }
    })

    pipeline.push({
        $lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "ownerDetails",
            pipeline: [
                {
                    $project: {
                        username: 1,
                        fullName: 1,
                        avatar: 1,
                    }
                }
            ]
        }
    })

    pipeline.push({
        $unwind: "$ownerDetails"
    })
    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    }

    const videoAggregate = Video.aggregate(pipeline);

    const result = await Video.aggregatePaginate(videoAggregate, options);

    if (!result) {
        return res.status(200)
            .json(new ApiResponse(200,
                result,
                "No videos found matching the criteria"
            ))
    }

    return res.status(200)
        .json(new ApiResponse(200,
            result,
            "Videos fetched successfully"
        ))

})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    const { title, description } = req.body;

    const thumbnailfile = req.file?.path
    if (!thumbnailfile) {
        throw new ApiError(404, "Avatar path file not found");
    }
    const thumbnail = await uploadOnCloudinary(thumbnailfile);

    if (!thumbnail) {
        throw new ApiError(400, "couldn't find the thumbnail");
    }



    await Video.findByIdAndUpdate(videoId,
        {
            $set: {
                title: title,
                description: description,
                thumbnail: thumbnail.url,
            }
        }
    )
    return res.status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Details were updated"
            )
        )


})

const updateVideoViews = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    // Use $inc to atomically increment the views field
    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $inc: { views: 1 }
        },
        { new: true }
    );

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    return res.status(200)
        .json(new ApiResponse(200, video.views, "Views updated successfully"));
});

const deleteVideo = asyncHandler(async (req,res)=>{
    const {videoId} = req.params;

    const video = await Video.findById(videoId);

    const deletedFile = await deleteOnCloudinary(video.videoFile);
    await deleteOnCloudinary(video.thumbnail);
    // console.log("deleted file res: ", deletedFile)
    if(!deletedFile) {
        throw new ApiError (404, "There was some error deleting the file");
    }

   await Video.findByIdAndDelete(videoId); // deleting from db

    return res.status(200)
    .json (
        new ApiResponse(200,
            deletedFile,
            "THe file was deleted successfully!"
        )
    )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    const video = await Video.findById(videoId);

    if(!video) {
        throw new ApiError(400,"couldn't find video")
    }

    video.isPublished = !video.isPublished

    await video.save()

    return res.status(200).
    json(
        new ApiResponse (200,
            video.isPublished,
            "The status was toggled successfully"
        )
    )
})

export {
    getVideoById,
    publishAVideo,
    getAllVideos,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    updateVideoViews
}