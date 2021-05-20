const mongoose = require('mongoose');

const UserSchema=new mongoose.Schema({

_id:String,

provider:String,

firstName:String,

friends:
[

],

city:String,

email:String,

taskCompleted:
[
    {day:String,
    taskName:String,
    session_link:String
    }
],

taskCreated:[
    {
        day:String,
        taskName:String,
        session_link:String
    }
],


mehfil:
[
    {
    roomName:String,
    day:String
    }
],

image:{type:String},
city:String
})


module.exports=mongoose.model('User',UserSchema);


//maybe we can assign provider here