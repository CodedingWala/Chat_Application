import mongoose from "mongoose";

const GroupSchema= new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    admin:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    members:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }],
       profilePic: {
        type: String,
        default: ""
    },

},{timestamps:true})

const Group=mongoose.model("Group",GroupSchema)

export default Group