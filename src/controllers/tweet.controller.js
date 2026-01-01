import mongoose, { isValidObjectId } from "mongoose"
import {Twitter as Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    // take tweet content from req.body
    // implicitly update owner by extracting from req.user;

    const {content}= req.body;

    if(!content) {
        throw new ApiError(400, "Can't create empty tweet");
    }
    console.log("this is user: ", req.user);
    const tweet = await Tweet.create( {
        content: content,
        owner: req.user?._id,
    })

    if(!tweet) {
        throw new ApiError(404, "the tweet can't be created");
    }

    return res.status(200)
    .json(
        new ApiResponse(200,
            tweet,
            "The tweet was created successfully"
        )
    )
})

const getUserTweets = asyncHandler(async (req, res) => {
    const {userId} = req.params

    if (!mongoose.isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID format");
    }

    // grab user id,
    // then traverse through the tweets and pick up the ones whose user id matches the owner.

    const userTweets = await Tweet.find(
        {owner:userId}
    )

    if(!userTweets) {
        throw new ApiError(400,"couldn't fetch user tweets")
    }

    return res.status(200)
    .json(
        new ApiResponse(200,
            userTweets,
            "The tweets of the User fetched successfully!"
        )
    )
    // TODO: get user tweets
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    // grab the tweet from the param
    // take the content only
    // update

    const {tweetId} = req.params

    if (!mongoose.isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid Tweet ID format");
    }
    const {content} = req.body
    const getTweet = await Tweet.findById(tweetId);

    if(!getTweet) {
        throw new ApiError(404, "There was some error fetching the tweet")
    }
        // check if current user is the owner of the tweet
      
    if(!(getTweet.owner.equals(req.user.id))) {
        throw new ApiError(400,"The User is not the owner of the tweet")
    };
    
    if(!content) {
        throw new ApiError(400, "The tweet content is empty")
    }
    getTweet.content = content;

    await getTweet.save()

    return res.status(200)
    .json (
        new ApiResponse(200,
            getTweet,
            "The tweet was updated successfully"
        )
    )


})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId} = req.params

    if (!mongoose.isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid Tweet ID format");
    }

     const getTweet = await Tweet.findById(tweetId);

       if(!getTweet) {
        throw new ApiError(404, "There was some error fetching the tweet")
    }

    console.log("req.user : ", req.user);
    console.log("get tweet oiwner", getTweet);
    
    if(!(getTweet.owner.equals(req.user.id))) {
        throw new ApiError(400,"The User is not the owner of the tweet")
    };

       const deletedTweet=await Tweet.findByIdAndDelete(tweetId);

    return res.status(200)
    .json(
        new ApiResponse(200,
            deletedTweet,
            "Tweet Deleted Successfully!"
        )
    )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}