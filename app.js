//jshint esversion:6

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bcrypt = require('bcrypt')
const saltRounds = 10;


const app = express();

//console.log(process.env.DB_HOST);

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));


mongoose.set('strictQuery', false);

mongoose.connect("mongodb://127.0.0.1:27017/userDB");

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});



const User = new mongoose.model("User", userSchema);


app.get("/", function(req, res){
    res.render("home");
});

app.get("/login", function(req, res){
    res.render("login");
});

app.get("/register", function(req, res){
    res.render("register");
});


app.post("/register", function(req, res){

     const userName = req.body.username;
     const password = req.body.password;

     bcrypt.hash(password, saltRounds, function(err, hash) {
    
     const newUser = new User({
        email: userName,
        password: hash
     })


    

     newUser.save(function(err){
        if(!err) {
            res.render("secrets");
        }else {
            res.send(err);
        }
     });
    });
});

app.post("/login", function(req, res) {
    const userName = req.body.username;
    const password = req.body.password; 



    User.findOne({email: userName}, function(err, userFound){
    
        if(userFound) {
            bcrypt.compare(password, userFound.password, function(err, result){ 
                if (result === true) {
                    res.render("secrets");
                }else {
                    res.send("wrong password");
                }})
            }else{
                res.send("User not found")
            }
            });


        
});
    



app.listen(3000, function(){
    console.log("Server started on port 3000");
});