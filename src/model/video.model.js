import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";                     // this is used for devidingx videos into smaller chunks 


const videoSchema = new mongoose.Schema(
    {
        videoFile: {
            type:String,
            required:true,
        },

        thumbnail:{
            type:String,
            required:true
        },

        title:{
            type:String,
            required:true
        },

        descriptiom:{
            type:String,
            required:true
        },

        duration:{
            type:Number,
            required:true
        },

        views:{
            type:Number,
            default:0,
        },
        
        isPublished:{
            type:Boolean,
            default:true,
        },

        owner:{
            ref:'User',
            type:mongoose.Schema.Types.ObjectId
        }
    }
,{timestamps:true})

videoSchema.plugin(mongooseAggregatePaginate)        // this is used for devidingx videos into smaller chunks

export const Video = mongoose.model('Video',videoSchema)