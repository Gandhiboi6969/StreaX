const passport = require("passport");
const FacebookStrategy = require('passport-facebook').Strategy;
const mongoose=require('mongoose');
const keys = require("./keys.copy");
const User = require("../models/user-model");

// serialize the user.id to save in the cookie session
// so the browser will remember the user when login



function initializeFacebook(passport)
{   

   const authenticateUser=async (accessToken, refreshToken, profile, done)=>{
   
   
    console.log(profile.displayName);
  
   const newUser={
   _id:profile.id,
   firstName:profile.displayName,
   image:profile.photos ? profile.photos[0].value : '/img/faces/unknown-user-pic.jpg',
   provider:'facebook',
   city:'Delhi', 
  }
    
   try{
    let user=await User.findOne({_id:profile.id});
    if(user){done(null,user);}
    else {
      user=await User.create(newUser);
      done(null,user);
      
    }
   }
   catch(err){console.error(err)}
   
}



    passport.use(new FacebookStrategy({
        clientID: keys.FACEBOOK_APP_ID,
        clientSecret: keys.FACEBOOK_APP_SECRET,
        callbackURL: "/auth/facebook/callback",
        profileFields: ['id', 'displayName', 'name', 'gender', 'picture.type(large)']
      },
      authenticateUser
    ));
    passport.serializeUser(function(user, done) {
      done(null, user.id);
    });
    
    passport.deserializeUser(function(id, done) {
      User.findById(id, function(err, user) {
        done(err, user);
      });
    });
}

module.exports=initializeFacebook;