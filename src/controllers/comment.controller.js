import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    const commentQuery = Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },{
            $lookup: {
                from: "users",
                localField:"owner",
                foriegnField:"_id",
                as: "owner",
                pipeline:[
                    {
                        $project:{
                            username: 1,
                            avatar:1,
                            fullName:1,
                        }
                   },
                  
                ]
            }
        },
        {
            $addfields:{
                $first:"$owner"
            }
        },
        {
            $sort: { createdAt: -1 }
        }

    ])
   


     const options = {
        page: parseInt(page,10),
        limit: parseInt(limit,10)
    }

    const result = await Comment.aggregatePaginate(commentQuery,options);

    if(!result) {
        throw new ApiError(400,"Couldn't find comments")
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            result,
            "Comments fetched successfully"
        )
    )
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {content} = req.body;
    const {videoId} = req.params;

if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video ID format");
    }

    if(!content) {
        throw new ApiError(400,"Content is Required");
    }

    const newComment =await Comment.create({
        content: content,
        video: videoId,
        owner: req.user?._id,
    })

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            newComment,
            "Comments was added"
        )
    )
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId} = req.params;
    const {content} = req.body; 
    if(!mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400,"The commentId is Invalid")
    }

   const updateComment = await Comment.findOne({
    _id:commentId
   })

   if(!updateComment) {
        throw new ApiError(400,"Couldn't fetch Comment");
   }

   // AUTHORIZATION: Check if the user owns the comment
    if (updateComment.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You do not have permission to edit this comment");
    }

   updateComment.content = content;

   await updateComment.save()

     return res.status(200)
    .json(
        new ApiResponse(
            200,
            updateComment,
            "Comments was updated"
        )
    )

})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
       const {commentId} = req.params;

         if(!mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400,"The commentId is Invalid")
    }
       const comment = await Comment.findById(commentId);

       if(!comment) {
        throw new ApiError(400,"The comment couldn't be fetched")
       }

       if(comment.owner.toString()!==req.user?._id.toString()) {
        throw new ApiError(400,"The user is not the owner of the Comment")
       }
        

       await Comment.findByIdAndDelete(commentId);

         return res.status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "Comments was deleted"
        )
    )
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }