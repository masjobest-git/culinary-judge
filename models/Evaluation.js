
const mongoose = require('mongoose');

const evaluationSchema = new mongoose.Schema({
  judge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  competitor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Competitor',
    required: true
  },
  dishCategory: {
    type: String,
    enum: ['Appetizer', 'Main Course', 'Dessert'],
    required: true
  },
  criterionScores: [{
    scoringGroup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ScoringGroup',
      required: true
    },
    criterionName: {
      type: String,
      required: true
    },
    points: {
      type: Number,
      required: true,
      min: 0
    }
  }]
});

evaluationSchema.index(
  {
    judge: 1,
    competitor: 1,
    dishCategory: 1
  },
  {
    unique: true
  }
);

module.exports = mongoose.model('Evaluation', evaluationSchema);
