const mongoose = require('mongoose');

const qrcodeSchema = new mongoose.Schema({
    code: {type: String, unique: true},
    isUsed: Boolean
});

module.exports = mongoose.model('Qrcode', qrcodeSchema);