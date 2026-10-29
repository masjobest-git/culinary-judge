const mongoose = require('mongoose');
require('dotenv').config();

const ScoringGroup = require('../models/ScoringGroup');

const scoringGroups = [
  { name: 'Preparatory Work' },
  { name: 'Cooking Process' },
  { name: 'Final Tasks' },
  { name: 'Taste and Appearance' }
];

async function createScoringGroups() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    for (const group of scoringGroups) {
      await ScoringGroup.findOneAndUpdate(
        { name: group.name },
        {
          $set: { name: group.name },
          $setOnInsert: { criteria: [] }
        },
        { upsert: true, returnDocument: 'after' }
      );
    }

    console.log('Scoring groups saved successfully.');
  } catch (error) {
    console.log(error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

createScoringGroups();
