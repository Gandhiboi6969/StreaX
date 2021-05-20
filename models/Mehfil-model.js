const mongoose = require('mongoose');

const MehfilSchema=new mongoose.Schema({
    
roomName:String,
day:String,
users:[{
    _id:String,
    name:String
}],

roomName:String,
chats:[{
    username:String,
    Message:String
}],
timeElapsed:Number

})


module.exports=mongoose.model('Mehfil',MehfilSchema);