import mongoose from "mongoose";
const activitySchema = new mongoose.Schema({
    nft:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'NFT',
    },
    interactiveUser:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    type: {
        type: String,
    }
},
{
    timestamps: {createdAt: 'created_at'}
}
)

const Activity = mongoose.model("Activity", activitySchema)
export default Activity;