import mongoose from "mongoose"
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
    // const subscribers= await Subscription.find(
    //     {channel:channelId}
    // ).select("subscriber -_id")
    // .populate("subscriber", "username, fullName, avatar")

    const subscribers = await Subscription.aggregate([
        {
            $match:{channel: new mongoose.Types.ObjectId(channelId)} 
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriber",
                pipeline:[
                    {
                        $project:{
                            username: 1,
                            fullName: 1,
                            avatar:1,
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
            subscriber: {
                $first: "$subscriber"
            }
        }
        }
    ])

    console.log("SubscribeR: ", subscribers);

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
const subscribedChannels = await Subscription.aggregate([
    {
        // 1. Find all subscriptions made BY this user
        $match: {
            subscriber: new mongoose.Types.ObjectId(subscriberId) 
        }
    },
    {
        // 2. Join with the users collection to get channel details
        $lookup: {
            from: "users",
            localField: "channel",
            foreignField: "_id",
            as: "subscribedChannel",
            pipeline: [
                {
                    $project: {
                        username: 1,
                        fullName: 1,
                        avatar: 1
                    }
                }
            ]
        }
    },
    {
        // 3. Turn the 'subscribedChannel' array into a single object
        $unwind: "$subscribedChannel"
    },
    {
        // 4. Move the channel details to the top level
        $project: {
            _id: "$subscribedChannel._id",
            username: "$subscribedChannel.username",
            fullName: "$subscribedChannel.fullName",
            avatar: "$subscribedChannel.avatar"
        }
    }
]);

    if(subscribedChannels.length=== 0) {
        throw new ApiError(400,"You haven't subscribed to any channels.");
    }
    return res.status(200).
    json(
        new ApiResponse(
            200,
            subscribedChannels,
            "channels list fetched successfully."
        )
    )
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}