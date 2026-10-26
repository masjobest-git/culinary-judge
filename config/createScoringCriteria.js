
const mongoose = require('mongoose');
require('dotenv').config();

const ScoringGroup = require('../models/ScoringGroup');

const scoringCriteria = [
  {
    group: 'Preparatory Work',
    criteria: [
      { name: 'Required Work Documentation', maxPoints: 4 },
      { name: 'Personal Hygiene', maxPoints: 2 },
      { name: 'Food Preparation and Storage', maxPoints: 3 },
      { name: 'Workstation Organization', maxPoints: 2 },
      { name: 'Preparation of Utensils, Tools and Equipment', maxPoints: 2 },
      { name: 'Preparation Time', maxPoints: 2 }
    ]
  },
  {
    group: 'Cooking Process',
    criteria: [
      { name: 'Basic Food Preparation', maxPoints: 3 },
      { name: 'Demonstrated Food Preparation Skills', maxPoints: 3 },
      { name: 'Use of Professional Terminology', maxPoints: 3 },
      { name: 'Use of Utensils, Tools and Equipment', maxPoints: 3 },
      { name: 'Food Storage and Handling', maxPoints: 4 },
      { name: 'Efficiency of Work', maxPoints: 3 },
      { name: 'Personal Hygiene During Work', maxPoints: 3 },
      { name: 'Workstation Hygiene During Cooking', maxPoints: 3 },
      { name: 'Proper Waste Disposal', maxPoints: 3 },
      { name: 'Meal Preparation Time', maxPoints: 2 }
    ]
  },
  {
    group: 'Final Tasks',
    criteria: [
      { name: 'Washing and Storing Utensils', maxPoints: 1 },
      { name: 'Cleaning the Workstation', maxPoints: 2 },
      { name: 'Task Completion Time', maxPoints: 2 }
    ]
  },
  {
    group: 'Taste and Appearance',
    criteria: [
      { name: 'Portion Weight According to Standards', maxPoints: 5 },
      { name: 'Appearance of Dishes According to Standards', maxPoints: 10 },
      { name: 'Serving Temperature', maxPoints: 5 },
      { name: 'Texture and Taste of Individual Components', maxPoints: 20 },
      { name: 'Balance of Texture and Taste Between Components', maxPoints: 10 }
    ]
  }
];

async function createScoringCriteria() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    for (const groupData of scoringCriteria) {
      const group = await ScoringGroup.findOne({
        name: groupData.group
      });

      if (!group) {
        throw new Error(`Scoring group not found: ${groupData.group}`);
      }

      group.criteria = groupData.criteria.map(criterion => ({
        name: criterion.name,
        minPoints: 0,
        maxPoints: criterion.maxPoints
      }));

      await group.save();
    }

    console.log('Scoring criteria saved successfully.');
  } catch (error) {
    console.log(error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

createScoringCriteria();
