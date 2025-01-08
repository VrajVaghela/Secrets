//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB")

const userSchema = new mongoose.Schema ({
    email: String,
    password: String,
    googleId: String,
    secret: String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, cb) {
    process.nextTick(function() {
      return cb(null, {
        id: user.id,
        username: user.username,
        picture: user.picture
      });
    });
  });
  
  passport.deserializeUser(function(user, cb) {
    process.nextTick(function() {
      return cb(null, user);
    });
  });
  

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    // console.log(profile);
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
        if (err) {
            console.log("Error during user creation:", err);
            return cb(err);
        }
        // console.log("User found or created:", user);
        return cb(null, user);
    });
  }
));

app.get("/", function (req, res) {
    res.render("home");
});

app.get("/auth/google", 
    passport.authenticate('google', {scope: ["profile"] })
);

app.get("/auth/google/secrets", 
    passport.authenticate('google', { failureRedirect: '/login' }),
    function(req, res) {
      // Successful authentication, redirect secrets.
      res.redirect('/secrets');
    });

app.get("/login", function (req, res) {
    res.render("login");
});

app.get("/register", function (req, res) {
    res.render("register");
});

app.get("/logout", function(req, res){
    req.logout(function(err){
        if(err) console.log(err);
    });
    res.redirect("/");
})

app.get("/secrets", async function (req, res) {
    try {
        // Use await with Model.find()
        const foundUsers = await User.find({ "secret": { $ne: null } });

        if (foundUsers) {
            res.render("secrets", { userwithSecrets: foundUsers });
        }
    } catch (err) {
        console.log("Error:", err);
        res.redirect("/login");
    }
});

app.get("/submit", function(req, res){
    if(req.isAuthenticated()){
        res.render("submit");
    }
    else{
        res.redirect("/login");
    }
})

app.post("/submit", async function (req, res) {
    if (req.isAuthenticated()) {
        try {
            const submittedSecret = req.body.secret;

            // Use async/await instead of callbacks
            const foundUser = await User.findById(req.user.id);

            if (foundUser) {
                foundUser.secret = submittedSecret; // Add the secret
                await foundUser.save(); // Save the document
                res.redirect("/secrets");
            } else {
                console.log("User not found.");
                res.redirect("/submit");
            }
        } catch (err) {
            console.log("Error:", err);
            res.redirect("/login");
        }
    } else {
        res.redirect("/login");
    }
});


app.post("/register", function (req, res) {
    User.register({username: req.body.username}, req.body.password, function(err, user){
        if(err){
            console.log(err);
            res.redirect("/register");
        } else{
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secrets");
            });
        }
    })
});

app.post("/login", function (req, res) {
    
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });
    req.login(user, function(err){
        if(err){
            console.log(err);
        }else{
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secrets"); 
            })
        }
    })
});


app.listen(3000, function () {
    console.log("Server running successfully");
});