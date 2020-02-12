const express = require("express");
const router = express.Router();

const Award = require('../models/award');
const Vote = require('../models/vote');
const Booth = require('../models/booth');

//Middleware
const middleware = require('../middleware');

//For Judge
router.post('/judge', middleware.isLoggedIn, middleware.isAdminLoggedIn, (req, res) => {
    const newAward = new Award({
        awardName: req.body.awardName,
        forBooth: false,
        forJudge: true
    });
    
    newAward.save()
        .then(award => {
            res.redirect('/adminhub/awards/judge');
        })
        .catch(err => console.log(err));
});
// For booth
router.post('/booth', middleware.isLoggedIn, middleware.isAdminLoggedIn, (req, res) => {
    const newAward = new Award({
        awardName: req.body.awardName,
        forBooth: true,
        forJudge: false
    });
    
    newAward.save()
        .then(award => {
            res.redirect('/adminhub/awards/booth');
        })
        .catch(err => console.log(err));
});
//SHOW UPDATE FORM
router.get('/:awardId/edit', middleware.isLoggedIn, middleware.isAdminLoggedIn, (req, res) => {
    Award.findById(req.params.awardId)
        .then(foundAward => res.render('award/edit', {award: foundAward}))
        .catch(err => console.log(err));
});

//UPDATE Award
router.put("/:awardId", middleware.isLoggedIn, middleware.isAdminLoggedIn, (req, res) => {
    const updateAward = {
        awardName: req.body.awardName
    };
    Award.findByIdAndUpdate(req.params.awardId, updateAward)
        .then(updatedAward => res.redirect('/'))
        .catch(err => console.log(err));
});

//DELETE AWARD AND VOTE
router.delete('/:awardId', middleware.isLoggedIn, middleware.isAdminLoggedIn, (req, res) => {
    Award.findById(req.params.awardId)
        .then(foundAward => {
            Vote.deleteMany({award: {id: foundAward._id}})
                .then(result => {
                    foundAward.remove()
                        .then(result => res.redirect('back'))
                        .catch(err => console.log(err));
                })
                .catch(err => console.log(err));
        })        
        .catch(err => console.log(err));
});


module.exports = router;