const express = require('express');
const router = express.Router({mergeParams: true});
const mongoose = require('mongoose');
const generate = require('color-generator');
const nodemailer = require('nodemailer');
const randomize = require('randomatic');
const QRCode = require('qrcode');
const { createCanvas, getImageData, loadImage } = require('canvas');
const canvas = createCanvas(200, 200);
const db = mongoose.connection;
require('dotenv').config();
const administrator = process.env.ADMINISTRATOR || process.env.LOCALADMIN;
const state = process.env.STATE || process.env.LOCALSTATE;

//Models
const Vote = require('../models/vote');
const Booth = require('../models/booth');
const Voter = require('../models/voter');
const Award = require('../models/award');
const Result = require('../models/result');
const State = require('../models/websitestate');
const QrCodeModel = require('../models/qrcode');

//Middleware
const middleware = require('../middleware');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
           user: process.env.EMAIL,
           pass: process.env.PASS
    }
});
// For QR
var opts = {
    errorCorrectionLevel: 'L',
    type: 'image/jpeg',
    margin: 1,
    scale: 15
}

router.get('/', middleware.isLoggedIn, middleware.isAdminLoggedIn, (req, res) => {
    State.findById(state)
        .then(state => { 
            Voter.find()
                .then(voters => {
                    Vote.find()
                        .then(votes => {
                        Booth.find()
                            .then(booths => {
                                Award.find()
                                    .then(awards => res.render('admin/index', {booths, state, votes, voters, awards}))
                                    .catch(err => console.log(err))
                            })
                            .catch(err => console.log(err))
                    }).catch(err => console.log(err));
            }).catch(err => console.log(err));
        }).catch(err => console.log(err));
});

router.get('/booths', middleware.isLoggedIn, middleware.isAdminLoggedIn, (req, res) => {
    const ifAdmin = req.user._id.equals(administrator) || req.user.admin;
    Booth.find()
        .then(allBooths => {
            State.findById(state)
                .then(foundState => res.render('admin/booths', {booths: allBooths, ifAdmin: ifAdmin, foundState}))
                .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
});

router.get('/awards/judge', middleware.isLoggedIn, middleware.isAdminLoggedIn, (req, res) => {
    const ifAdmin = req.user._id.equals(administrator) || req.user.admin;
    Award.find()
        .then(allAwards => {
            State.findById(state)
                .then(foundState =>res.render('admin/awardsJudge', {awards: allAwards, ifAdmin: ifAdmin, foundState}))
                .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
});
router.get('/awards/booth', middleware.isLoggedIn, middleware.isAdminLoggedIn, (req, res) => {
    const ifAdmin = req.user._id.equals(administrator) || req.user.admin;
    Award.find()
        .then(allAwards => {
            State.findById(state)
                .then(foundState =>res.render('admin/awardsBooth', {awards: allAwards, ifAdmin: ifAdmin, foundState}))
                .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
});

router.get('/scores', middleware.isLoggedIn, middleware.isAdminLoggedIn, (req, res) => {
    Award.find().populate('booth')
        .then(allAwards => { 
            Booth.find()
                .then(allBooths => {
                    State.findById(state)
                        .then(foundState => res.render('admin/results', {awards: allAwards, booths: allBooths, foundState}))
                        .catch(err => console.log(err));
                })
                .catch(err => console.log(err));
        }).catch(err => console.log(err));
});

router.post('/winners', middleware.isLoggedIn, middleware.isAdminLoggedIn, (req, res) => {
    Award.find().populate('booth')
        .then(allAwards => { 
            Booth.find()
                .then(allBooths => {
                    //awards 
                    allAwards.forEach((award) => {
                        //booths 
                        allBooths.forEach((booth) => {
                            global[booth._id] = 0;
                            //vote of a booth 
                            booth.vote.forEach((vote) => {
                                if(vote.awardId.equals(award._id)){
                                    global[booth._id] += Number(vote.voteCount)
                                } 
                            })
                            var result = new Result({
                                awardName: award.awardName,
                                awardId: award._id,
                                boothName: booth.boothName,
                                boothId: booth._id,
                                totalScore: global[booth._id]
                            });
                            result.save();
                        });
                    })
                })
                .then(() => res.redirect('/adminhub/winners'))
                .catch(err => console.log(err));
        }).catch(err => console.log(err)); 
});

router.get('/winners', middleware.isLoggedIn, middleware.isAdminLoggedIn, (req, res) => {
    Award.find().populate('booth')
        .then(allAwards => { 
            Booth.find()
                .then(allBooths =>{
                    Result.find()
                        .then(results => {
                            State.findById(state)
                                .then(foundState => res.render('admin/winners', {awards: allAwards, booths: allBooths, results: results, foundState}))
                                .catch(err => console.log(err));
                        })
                        .catch(err => console.log(err));
                })
                .catch(err => console.log(err));
        }).catch(err => console.log(err));
});

router.delete('/dropresult', middleware.isLoggedIn, middleware.isAdminLoggedIn, (req, res) => {
    db.dropCollection('results')
        .then(result => console.log('drop collection success'), res.redirect('/adminhub/scores'))
        .catch(err => console.log('drop collection error'));
});

//Change State
router.put('/changestate', middleware.isLoggedIn, middleware.isAdminLoggedIn, (req, res) => {
    State.findById(state)
        .then(foundState => {
            foundState.updateOne({state: !foundState.state})
                .then(result => {
                    console.log(result);
                    res.redirect('back');
                }).catch(err => console.log(err));
        }).catch(err => console.log(err));
});

// Register Form
router.get('/register', middleware.isLoggedIn, middleware.isAdminLoggedIn, (req, res) => {
    res.render('admin/register');
});

//Register QRCode 
router.post('/register/qrcode', middleware.isLoggedIn, middleware.isAdminLoggedIn, (req, res) => {
    // var numOfQrArray = [];
    // var numOfQr = Number(req.body.qrcode);
    // for(var i = 1; i <= numOfQr; i++){
    //     numOfQrArray.push(i);
    // }
    // numOfQrArray.forEach((num) => {
    //     var randomCode = randomize('aA0', 8, { exclude: '0oOiIlL1' });
    //     qrCodes.push(randomCode);
    //     console.log(generateQR());
    // });
    var randomCode = randomize('aA0', 8, { exclude: '0oOiIlL1' });
    QRCode.toDataURL(randomCode, opts)
        .then(url => {
            const mailOptions = {
                from: process.env.EMAIL, // sender address
                to: req.body.email, // list of receivers
                subject: 'Qr Codes', // Subject line
                html: `<div>Here are your QR Codes.</div>`, // plain text body
                attachments: [
                    {
                        filename: `qr.jpg`,
                        content: url.split('base64,')[1],
                        encoding: 'base64'
                    }                
                ]
            };
            transporter.sendMail(mailOptions, function (err, info) {
                if(err){
                    console.log('Nodemailer:' + err)
                }else{
                    var qrcode = new QrCodeModel({
                        code: randomCode,
                        isUsed: false
                    });
                    qrcode.save()
                        .then(savedQr => console.log(savedQr), res.redirect('back'))
                        .catch(err => console.log(err));
                }
            })
        }).catch(err => console.log(err));
});


//Register Booth
router.post('/register/booth', middleware.isLoggedIn, middleware.isAdminLoggedIn, (req, res) => {
    var randomCode = randomize('aA0', 8, { exclude: '0oOiIlL1' });
    console.log(req.body);
    console.log(randomCode);
    var newVoter = new Voter({username: req.body.username, judge: false, booth: true});
    Voter.register(newVoter, req.body.password)
        .then(voter => {
            console.log(voter);
            var newBooth = new Booth({
                boothName: req.body.boothName,
                information: req.body.information,
                subInformation: req.body.subInformation,
                color: generate().hexString(),
                code: randomCode,
                image: req.body.image,
                account: voter._id
            });
            newBooth.save()
                .then(savedBooth => {
                    req.flash('success', "You've successfully registered a Booth.");
                    voter.updateOne({boothId: savedBooth._id})
                        .then(result => {
                            const mailOptions = {
                                from: process.env.EMAIL, // sender address
                                to: req.body.email, // list of receivers
                                subject: 'Login Now!', // Subject line
                                html: `<div>Hello ${req.body.boothName}! Here are your credentials: <br> <h4>Username:  <span>${req.body.boothName}</span> </h4> <br> <h4>Password: </h4> <span>${req.body.password}</span> </div>`, // plain text body
                            };
                            transporter.sendMail(mailOptions, function (err, info) {
                                if(err){
                                    console.log('Nodemailer:' + err)
                                }else{
                                    res.redirect('back')
                                }
                            });
                        }).catch(err => console.log(err));
                }).catch(err => {
                    req.flash('error', err.message);
                    res.redirect('back');
                });
        }).catch(err => {
            req.flash('error', err.message);
            res.redirect('back');
        });
});
//Register Judge
router.post('/register/judge', middleware.isLoggedIn, middleware.isAdminLoggedIn, (req, res) => {
    console.log(req.body);
    var newVoter = new Voter({username: req.body.username, judge: true, booth: false});
    Voter.register(newVoter, req.body.password)
        .then(voter => {
            req.flash('success', 'You successfully registered a Judge.');
            res.redirect('back');
        })
        .catch(err => {
            console.log(err); 
            req.flash('error', err.message);
            res.redirect('back');
        });
});
// This will be called on ajax
router.get('/api/datas', middleware.isLoggedIn, middleware.isAdminLoggedIn, (req, res) => {
    Award.find().populate('booth')
        .then(allAwards => { 
            Booth.find()
                .then(allBooths => {
                    State.findById(state)
                        .then(states => res.json({allAwards, allBooths, states}))
                        .catch(err => console.log(err));
                })
                .catch(err => console.log(err));
        }).catch(err => console.log(err));
});


module.exports = router;