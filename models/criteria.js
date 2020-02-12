const mongoose = require('mongoose');

const criteriaSchema = new mongoose.Schema({
    criteria: {type: String, unique: true},
    percentage: Number
});

module.exports = mongoose.model('Criteria', criteriaSchema);