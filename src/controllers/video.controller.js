import {Video} from "../models/video.model.js";
import {User} from "../models/user.model.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getVideoById = asyncHandler(async(req,res)=>{
    // get video id,
    // make db call, Video.findById(videoId);
    // once gotten it then display response.

    const {videoId}=req.params;

    const videofetched =  await Video.findById(videoId);

    if(!videofetched) {
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

    const { title, description} = req.body

    const user = await User.findById(req.user?._id);

    const thumbnailLocalFilePath = req.file?.thumbnail[0]?.path;
    const videoLocalFilePath = req.file?.video[0]?.path;

    if (!thumbnailLocalFilePath) {
        throw new ApiError(400,"Thumbnail path not found");
    }
    if (!videoLocalFilePath) {
        throw new ApiError(400,"Video path not found");
    }
   
    const thumbnail = await uploadOnCloudinary(thumbnailLocalFilePath);
    const video = await uploadOnCloudinary(videoLocalFilePath);

    if(!thumbnail) {
        throw new ApiError(400,"Can't upload thumbnail");
    }
        if(!video) {
        throw new ApiError(400,"Can't upload video");
    }



  const uploadedVideo =  await Video.create(
            {
            
            title,
            description,
            thumbnail: thumbnail.url,
            video: video.url,
            duration: video.duration,   
            owner: user    
        }

    )
    if(!uploadedVideo){
        throw new ApiError(401,"Video not uploaded");
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
    

})

export {
    getVideoById,
    publishAVideo
}