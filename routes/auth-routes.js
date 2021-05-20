const router = require("express").Router();
const passport = require("passport");
const CLIENT_HOME_PAGE_URL = "http://localhost:3000";
const User = require("../models/user-model");
// when login is successful, retrieve user info
router.get("/login/success", (req, res) => {
  if (req.user) {
    res.json({
      success: true,
      message: "user has successfully authenticated",
      user: req.user,
      cookies: req.cookies
    });
 
  }
});

// when login failed, send failed msg
router.get("/login/failed", (req, res) => {
  res.status(401).json({
    success: false,
    message: "user failed to authenticate."
  });
});

// When logout, redirect to client
router.get("/logout", (req, res) => {
  req.logout();
  res.redirect(CLIENT_HOME_PAGE_URL);
});

// auth with twitter
router.get("/facebook", passport.authenticate("facebook"));



// redirect to home page after successfully login via twitter
router.get(
  "/facebook/callback",
  passport.authenticate("facebook", {
    successRedirect: CLIENT_HOME_PAGE_URL,
    failureRedirect: "/auth/login/failed"
  })
);
router.get('/google',passport.authenticate('google', { scope: ['profile'] }));

router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/auth/login/failed' }),
function(req, res) {
    // Successful authentication, redirect home.
res.redirect(CLIENT_HOME_PAGE_URL);
});






//database queries
router.get('/userData',(req,res)=>{
  const userID=req.user._id;
  User.findById(userID, function (err, user) {

    res.json({
      user:user
    })
  });
})



module.exports = router;
