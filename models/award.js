const mongoose = require('mongoose');

const awardSchema = new mongoose.Schema({
    awardName: String,
    forBooth: Boolean,
    forJudge: Boolean,
    booth:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Booth'
        }
    ],
    voter:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Voter'
        }
    ],
    results: [
        {
            id:{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Booth'
            }, 
            totalScore: Number,
            boothName: String
        }
    ]
});

module.exports = mongoose.model('Award', awardSchema);