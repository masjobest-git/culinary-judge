
const mongoose = require('mongoose');

const scoringGroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  criteria: [{
    name: {
      type: String,
      required: true
    },
    minPoints: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    maxPoints: {
      type: Number,
      required: true,
      min: 0
    }
  }]
});

module.exports = mongoose.model('ScoringGroup', scoringGroupSchema);
