
const express = require('express');
const router = express.Router();
const isSignedIn = require('../middleware/is-signed-in');
const Competitor = require('../models/Competitor');
const Evaluation = require('../models/Evaluation');
const ScoringGroup = require('../models/ScoringGroup');

// Open evaluation form
router.get('/new/:competitorId', isSignedIn, async (req, res) => {
  if (req.user.role !== 'judge') {
    return res.status(403).send('Access denied');
  }

  try {
    const competitor = await Competitor.findById(req.params.competitorId);

    if (!competitor) {
      return res.status(404).send('Competitor not found');
    }

    const scoringGroups = await ScoringGroup.find();

    res.render('evaluations/new', {
      competitor: competitor,
      scoringGroups: scoringGroups
    });
  } catch (error) {
    console.log(error);
    res.status(500).send('Error loading evaluation form');
  }
});

// Save evaluation
router.post('/:competitorId', isSignedIn, async (req, res) => {
  if (req.user.role !== 'judge') {
    return res.status(403).send('Access denied');
  }

  try {
    const competitor = await Competitor.findById(req.params.competitorId);

    if (!competitor) {
      return res.status(404).send('Competitor not found');
    }

    const validCategories = ['Appetizer', 'Main Course', 'Dessert'];

    if (!validCategories.includes(req.body.dishCategory)) {
      return res.status(400).send('Invalid dish category');
    }

    if (!req.body.scores) {
      return res.status(400).send('No scores received');
    }

    const scoringGroups = await ScoringGroup.find();
    const criterionScores = [];

    for (const group of scoringGroups) {
      for (const criterion of group.criteria) {
        const scoreValue = req.body.scores[criterion.name];

        if (scoreValue === undefined || scoreValue === '') {
          return res.status(400).send(
            'Missing points for ' + criterion.name
          );
        }

        const points = Number(scoreValue);

        if (
          !Number.isFinite(points) ||
          points < criterion.minPoints ||
          points > criterion.maxPoints
        ) {
          return res.status(400).send(
            'Invalid points for ' + criterion.name
          );
        }

        criterionScores.push({
          scoringGroup: group._id,
          criterionName: criterion.name,
          points: points
        });
      }
    }

    const evaluation = new Evaluation({
      judge: req.user._id,
      competitor: competitor._id,
      dishCategory: req.body.dishCategory,
      criterionScores: criterionScores
    });

    await evaluation.save();

    res.send('Evaluation saved successfully!');
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).send(
        'You have already evaluated this competitor in this category.'
      );
    }

    console.log(error);
    res.status(500).send('Error saving evaluation');
  }
});

// View evaluation results
router.get('/results', isSignedIn, async (req, res) => {
  if (req.user.role !== 'judge') {
    return res.status(403).send('Access denied');
  }

  try {
    const competitors = await Competitor.find().sort({ name: 1 });

    const evaluations = await Evaluation.find()
      .populate('competitor')
      .populate('criterionScores.scoringGroup');

    const scoringGroups = await ScoringGroup.find();
    const results = [];

    for (const competitor of competitors) {
      for (const category of ['Appetizer', 'Main Course', 'Dessert']) {
        const categoryEvaluations = evaluations.filter((evaluation) =>
          evaluation.competitor &&
          evaluation.competitor._id.toString() === competitor._id.toString() &&
          evaluation.dishCategory === category
        );

        if (categoryEvaluations.length === 0) {
          continue;
        }

        const groupResults = [];

        for (const group of scoringGroups) {
          let totalPoints = 0;
          let judgeCount = 0;

          for (const evaluation of categoryEvaluations) {
            const groupScores = evaluation.criterionScores.filter((score) =>
              score.scoringGroup &&
              score.scoringGroup._id.toString() === group._id.toString()
            );

            if (groupScores.length > 0) {
              totalPoints += groupScores.reduce(
                (sum, score) => sum + score.points,
                0
              );
              judgeCount++;
            }
          }

          groupResults.push({
            name: group.name,
            average: judgeCount > 0
              ? Number((totalPoints / judgeCount).toFixed(2))
              : null
          });
        }

        const totalPoints = categoryEvaluations.reduce(
          (sum, evaluation) =>
            sum + evaluation.criterionScores.reduce(
              (scoreSum, score) => scoreSum + score.points,
              0
            ),
          0
        );

        results.push({
          competitor: competitor,
          category: category,
          judgeCount: categoryEvaluations.length,
          groups: groupResults,
          averageTotal: Number(
            (totalPoints / categoryEvaluations.length).toFixed(2)
          )
        });
      }
    }

    res.render('judge/results', {
      results: results
    });
  } catch (error) {
    console.log(error);
    res.status(500).send('Error loading results');
  }
});

module.exports = router;
