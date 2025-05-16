import mongoose , {Schema}from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const tweetsSchema = new Schema({

    owner:{
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,

    },
    content:{
        type: String,
        required: true,
        
    }
},{timestamps: true});

export const Tweet = mongoose.model("Tweet",tweetsSchema); 