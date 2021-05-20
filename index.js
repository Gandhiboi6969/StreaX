const http = require('http');
const cookieSession = require("cookie-session");
const express = require("express");
const app = express();
const port = 4000;
const User = require("./models/user-model");
const Mehfil = require("./models/Mehfil-model");
const passport = require("passport");
const passportSetup = require("./config/passport-setup");
const session = require("express-session");
const authRoutes = require("./routes/auth-routes");
const mongoose = require("mongoose");
const keys = require("./config/keys.copy");
const cors = require("cors");
const cookieParser = require("cookie-parser"); // parse cookie header
const server = http.createServer(app);
const socketio = require('socket.io');
const io = socketio(server);
const bodyParser = require('body-parser');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./users-socket');

const passportGoogle=require("./config/passport-googleOauth");
// connect to mongodb
mongoose.connect(keys.MONGODB_URI, () => {
  console.log("connected to mongo db");
});

const PORT=process.env.PORT

passportSetup(passport);
passportGoogle(passport);

app.use(bodyParser.json());

app.use(
  cookieSession({
    name: "session",
    keys: [keys.COOKIE_KEY],
    maxAge: 24 * 60 * 60 * 100
  })
);

// parse cookies
app.use(cookieParser());

// initalize passport
app.use(passport.initialize());
// deserialize cookie from the browser
app.use(passport.session());

// set up cors to allow us to accept requests from our client
app.use(
  cors({
    origin: "http://localhost:3000", // allow to server to accept request from different origin
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true // allow session cookie from browser to pass through
  })
);

// set up routes
app.use("/auth", authRoutes);

const authCheck = (req, res, next) => {
  if (!req.user) {
    res.status(401).json({
      authenticated: false,
      message: "user has not been authenticated"
    });
  } else {
    next();
  }
};

// if it's already login, send the profile response,
// otherwise, send a 401 response that the user is not authenticated
// authCheck before navigating to home page
app.get("/", authCheck, (req, res) => {
  res.status(200).json({
    authenticated: true,
    message: "user successfully authenticated",
    user: req.user,
    cookies: req.cookies
  });
});


io.on('connect', (socket) => {
  
  console.log('connected to socket io');

  socket.on('join', ({ name, room }, callback) => {     
    const { error, user } = addUser({ id: socket.id, name, room });
    
    console.log('Socket Established');

    if(error) return callback(error);

    socket.join(user.room);

    socket.emit('message', { user: 'admin', text: `${user.name}, welcome to room ${user.room}.`});
    socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name} has joined!` });

    io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });

    callback();
  });

  socket.on('sendMessage', (message, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit('message', { user: user.name, text: message });

    callback();
  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    if(user) {
      io.to(user.room).emit('message', { user: 'Admin', text: `${user.name} has left.` });
      io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room)});
    }
  })
});




//data-retriveal



















//database retrivel
app.get('/leaderboard',(req,res)=>{

  
User.aggregate(
[
  { $sort : { taskCompleted : -1,_id: 1  } }
],
function(err,docs){

var users=[];

function compare( a, b ) {
  if ( a.tasks > b.tasks ){
    return -1;
  }
  if ( a.tasks < b.tasks ){
    return 1;
  }
  return 0;
}


for(var i=0;i<docs.length;i++)
{
  var obj=docs[i];
  users.push({id:obj._id,firstName:obj.firstName,tasks:obj.taskCompleted.length,mehfil:obj.mehfil.length});
} 

users.sort( compare );
res.send(users);
})
});

//post requests

app.post('/createMehfil',(req,res)=>{
const room=req.body.roomName;

Mehfil.findOne({roomName:room},function(err,docs){
  if(docs==null)
{
  const newMehfil={
  roomName:room,
  day:new Date().getDay(),
  users:[{_id:req.user.id,name:req.user.firstName}],
  timeElapsed:0
  }
  const createdM=Mehfil.create(newMehfil);  
}
else res.json('Old Mehfil');

})

})

app.post('/checkParticipants',(req,res)=>{
const userId=req.user._id;  
var parti=[];
let room=req.body.roomName;  //here also we need meet link
console.log(room);
const mehfil=Mehfil.findOne({roomName:room},function(err,docs){ 
if(docs!=null) 
{
parti=docs.users;

var found=false;
for(var i=0;i<parti.length;i++)
{
  if(parti[i]._id==userId)found=true;
}

if(!found){docs.users.push({_id:userId,name:req.user.firstName});docs.save();
console.log('new user');}
else console.log('old user');

const user=User.findOne({_id:req.user._id},function(err,docs){
  if(docs!=null)
  { var found=false;

    for(var i=0;i<docs.mehfil.length;i++)
    {
      var el=docs.mehfil[i];
      if(el.roomName==room)found=true;
    }
    
    if(!found)
    {
      docs.mehfil.push({roomName:room,day:new Date().getDay()});
      docs.save();
    }
  
  }
})


}


})
});




app.post('/participants',(req,res)=>{

let room=req.body.roomName;
Mehfil.findOne({roomName:room},function(err,docs){
  


if(docs!=null){
console.log(docs);
  res.json({
    participants:docs.users
})
}
})
  
})




app.post('/checkMehfilExists',(req,res)=>{
//here we need to get mehfil link how i dont know
var room=req.body.roomName

Mehfil.findOne({roomName:room},function(err,docs)
{ 
  if(docs==null){res.json('Error 404!');console.log('not found');}
  else {res.json({
    user:req.user
  })}
}
)

})


//ab todo list vali nautanki
app.post('/completeTasks',(req,res)=>{
console.log('deletion begins');

const uid=req.user._id;
const link=req.body.link
User.findOne({_id:uid},function(err,docs){

  docs.taskCompleted.push({day:new Date().getDay(),taskName:req.body.task,session_link:link});
  docs.save();
  console.log('task deleted');
  res.json('');
})

})


app.post('/updateInfo',(req,res)=>{

const uid=req.user._id;

const Name=req.body.firstName+' '+req.body.lastName;
User.findOne({_id:uid},function(err,docs){



if(req.body.Email!=='')
docs.email=req.body.Email;
if(req.body.City!=='')
docs.city=req.body.City;
if(Name!=='')
docs.firstName=Name;
docs.save();




res.json('done');

});


})



app.post('/addFriend',(req,res)=>{
  console.log('request recieved');
  const uid=req.user.id;

  User.findOne({_id:uid},function(err,docs){
    if(docs!=null)
    {
      docs.friends.push('oo');
      docs.save();
    }
  })


})



// connect react to nodejs express server
server.listen(port, () => console.log(`Server is running on port ${port}!`));


