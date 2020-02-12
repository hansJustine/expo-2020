const express = require('express');
const router = express.Router({mergeParams: true});
require('dotenv').config();
const administrator = process.env.ADMINISTRATOR || process.env.LOCALADMIN;

//Models
const Vote = require('../models/vote');
const Voter = require('../models/voter');
const Booth = require('../models/booth');
const Award = require('../models/award');
const Criteria = require('../models/criteria');
//Middleware
const middleware = require("../middleware");

router.get("/:awardId", middleware.isLoggedIn, (req, res) => {
    Booth.find()
        .then(allBooths => {
            Voter.findById(req.user._id)
                .then(foundVoter => {
                    Award.findById(req.params.awardId)
                        .then(foundAward =>  {
                            function isVoted(){    
                                for(var i = 0; i < foundAward.voter.length; i++){
                                    if(foundAward.voter[i]._id.equals(foundVoter._id)){
                                        return true;
                                    }
                                };
                                return false;
                            } 
                            res.render('award/show', {booths: allBooths, voter: foundVoter, award: foundAward, isVoted: isVoted()});
                        })
                        .catch(err => console.log(err));
                })
                .catch(err => console.log(err))
        })
        .catch(err => console.log(err));
});

router.post("/:awardId", middleware.isLoggedIn, (req, res) => {
    var vote = 0;
    const boothId = req.body.booth;
    const newVote = new Vote({
        voteCount: ++vote,
        voter: {
            id: req.user._id,
            username: req.user.username
        },
        booth: { id: boothId },
        award: { id: req.params.awardId }
    });
    newVote.save()
        .then(vote => {
            Award.findById(req.params.awardId)
                .then(foundAward => {
                    foundAward.booth.push(boothId);
                    foundAward.voter.push(req.user._id);
                    foundAward.save()
                        .then(savedAward => {
                            const boothVote = {
                                voteId: vote._id,
                                awardId: foundAward._id,
                                voteCount: vote.voteCount
                            }
                            Booth.findById(boothId)
                                .then(foundBooth => {
                                    foundBooth.vote.push(boothVote);
                                    foundBooth.save()
                                        .then(updatedBooth => {
                                            res.redirect('back');
                                            console.log(updatedBooth)
                                        }).catch(err => console.log(err))
                                })
                                .catch(err => console.log(err));
                        }).catch(err => console.log(err));
                }).catch(err => console.log(err))
        })
        .catch(err => console.log(err));
});

router.get("/:awardId/results", middleware.isLoggedIn, middleware.isAdminLoggedIn, (req, res) => {
    Booth.findById(req.params.boothId).populate('voteAndVoter').exec((err, allBooth) => {
        if(err){
            console.log(err);
        }else{
            console.log(allBooth);
            var result = 0;
            res.render("results", {booths: allBooth, result: result});
        }
    });
});


module.exports = router;