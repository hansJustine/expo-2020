const express = require('express');
const passport = require('passport');
const router = express.Router({mergeParams: true});
const nodemailer = require('nodemailer');
const randomize = require('randomatic');
const QRCode = require('qrcode');
const { createCanvas, getImageData, loadImage } = require('canvas');
const canvas = createCanvas(200, 200);
const ctx = canvas.getContext('2d');
require('dotenv').config();
const administrator = process.env.ADMINISTRATOR || process.env.LOCALADMIN;


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
           user: process.env.EMAIL,
           pass: process.env.PASS
       }
   });


//Models
const Vote = require('../models/vote');
const Booth = require('../models/booth');
const Award = require('../models/award');
const Voter = require('../models/voter');
const State = require('../models/websitestate');

//Middleware
const middleware = require("../middleware");



//Root Route
router.get('/', middleware.isLoggedIn, middleware.redirectToAdminHub, (req, res) => {
    const user = req.user;
    const ifAdmin = req.user._id.equals(administrator) || req.user.admin;
    Award.find()
        .then(allAwards => {
            res.render('indexOfBooth', {awards: allAwards, ifAdmin: ifAdmin, user: user});
        })
        .catch(err => console.log(err));
});

// REGISTER ADMIN
// router.get("/signup", middleware.loggedInInaccessible, (req, res) => {
//     res.render("register");
// });

// router.post("/signup", middleware.loggedInInaccessible, (req, res) => {
//     var newVoter = new Voter({username: req.body.username, booth: false, judge: false, admin: true});
//     Voter.register(newVoter, req.body.password)
//         .then(voter => {
//             req.flash('success', 'Hello Admin!');
//             res.redirect('back');
//         })
//         .catch(err => {
//             req.flash('error', err.message);
//             res.redirect('back');
//         });
          
// });

//LOGIN
router.get("/login", middleware.loggedInInaccessible, (req, res) => {
    res.render("login");
});
router.post("/login", middleware.loggedInInaccessible, passport.authenticate("local", 
    {
        successRedirect: "/",
        successFlash: "You are logged in successfully!",
        failureRedirect: "/login",
        failureFlash: true
    }), function(req, res){
    
});

//LOGOUT
router.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
});


module.exports = router;