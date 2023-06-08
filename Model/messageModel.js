const mongoose = require("mongoose");
const mssgSchema = mongoose.Schema({
    sender:String,
    recipient:String,
    content:String,
    timeStamp:{
        type:Date,
        default:Date.now
    }
},{
    versionKey:false
})
const MssgModel = mongoose.model("User",mssgSchema)
module.exports ={MssgModel}