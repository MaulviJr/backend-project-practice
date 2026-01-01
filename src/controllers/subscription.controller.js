import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params


    if (!mongoose.isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID format");
    }
    // TODO: toggle subscription

    const subscriptionObj = await Subscription.findOne(

        {
            channel: channelId,
            subscriber: req.user?._id
        }

    );

    console.log("subscription obj: ", subscriptionObj);
    let subscription;
    if (subscriptionObj) {
        subscription = await Subscription.findByIdAndDelete(subscriptionObj._id);

        return res.status(200)
            .json(
                new ApiResponse(
                    200,
                    {
                        subscribed: false,
                       deletedSubscription: subscription
                    },
                    "Unsubscribed successfully"
                )
            )

    } else {
        subscription = await Subscription.create({
            subscriber: req.user?._id,
            channel: channelId,
        })
    }

    return res.status(200).
        json(
            new ApiResponse(200,
                {
                    subscribed: true,
                    newSubscription: subscription
                },
                "the channel was subscribed."
            )
        )
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    // get Channel and see the subscribers by finding, store them in array
    
    if (!mongoose.isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID format");
    }
    const subscribers= await Subscription.find(
        {channel:channelId}
    ).select("subscriber -_id")
    .populate("subscriber", "username, fullName, avatar")

    if(subscribers.length=== 0) {
        throw new ApiError(400,"You ain't got no subscribers.");
    }
    return res.status(200).
    json(
        new ApiResponse(
            200,
            subscribers,
            "Subscribers list fetched successfully."
        )
    )


})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
       
  
    
    if (!mongoose.isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid channel ID format");
    }
    const channels= await Subscription.find(
        {subscriber:subscriberId}
    ).select("channel -_id")
    .populate("channel", "username, fullName, avatar")

    if(channels.length=== 0) {
        throw new ApiError(400,"You haven't subscribed to an channels.");
    }
    return res.status(200).
    json(
        new ApiResponse(
            200,
            channels,
            "channels list fetched successfully."
        )
    )
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}