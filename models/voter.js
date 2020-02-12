const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const voterSchema = new mongoose.Schema({
    username: String,
    password: String,
    boothId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booth'
    },
    booth: Boolean,
    judge: Boolean,
    admin: Boolean
});

voterSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("Voter", voterSchema);