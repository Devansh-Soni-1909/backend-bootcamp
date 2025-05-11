import mongoose , {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const videoSchema = new Schema({

    videoFile :{

        type : String , // cloudinary URL
        required : [true, "Video file is required"],


    },
    thumbnail : {
        type : String , // cloudinary URL
        required : [true, "thumbnail file is required"],

    },
    title : {
        type : String , 
        required : [true, "title  file is required"],

    },
    description : {
        type : String , 
        required : [true, "description file is required"],

    },
    duration : {
        type : Number , // cloudinary URL
        required : [true, "duration file is required"],

    },
    views : {
        type : Number ,
        default : 0,
    },
    isPublished :{
        type : Boolean ,
        default : true
    },
    owner : {
        type : Schema.Types.ObjectId,
        ref : "User",

    }



},{timestamps:true});

videoSchema.plugin(mongooseAggregatePaginate)




export const Video = mongoose.model("Video",videoSchema);