import mongoose, { Schema } from "mongoose";

const twitterSchema = new Schema({
    content: {
        type: String,
        required: true,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, {
    timestamps: true
})

export const Twitter = mongoose.model("Twitter", twitterSchema);