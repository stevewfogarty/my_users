//jshint esversion:6

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");



const app = express();

//console.log(process.env.DB_HOST);

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));


app.use(session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());


mongoose.set('strictQuery', false);

mongoose.connect("mongodb://127.0.0.1:27017/userDB");

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function(req, res){
    res.render("home");
});

app.get("/login", function(req, res){
    res.render("login");
});

app.get("/register", function(req, res){
    res.render("register");
});

app.get("/secrets", function(req, res){
    if (req.isAuthenticated()) {
        res.render("secrets");
    }else{
        res.redirect("/login");
    }
})

app.get("/logout", function(req, res, next){
    req.logout(function(err){
        if(err) {
            return next(err);
        }

    res.redirect("/");
    });
});


app.post("/register", function(req, res){

     const userName = req.body.username;
     const password = req.body.password;

     User.register({username: userName}, password, function(err, user){
        if(err) {
            console.log(err);
            res.redirect("/resgister");
        }else{
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secrets");
            });
        }
     })

     
});

app.post("/login", function(req, res) {
    const userName = req.body.username;
    const password = req.body.password; 

    const user = new User({
        username: userName,
        password: password
    });

    req.login(user, function(err){
        if(err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secrets");
            });
        }
    });




    
});
    



app.listen(3000, function(){
    console.log("Server started on port 3000");
});