
const Competitor = require('../models/Competitor');
const Evaluation = require('../models/Evaluation');
const ScoringGroup = require('../models/ScoringGroup');

// Open evaluation form
async function showEvaluationForm(req, res) {
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
}

// Save evaluation
async function saveEvaluation(req, res) {
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

    req.session.successMessage = 'Evaluation saved successfully!';

    res.redirect('/evaluations/results');
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).send(
        'You have already evaluated this competitor in this category.'
      );
    }

    console.log(error);
    res.status(500).send('Error saving evaluation');
  }
}

// Open correction form
async function showCorrectionForm(req, res) {
  if (req.user.role !== 'judge') {
    return res.status(403).send('Access denied');
  }

  try {
    const evaluation = await Evaluation.findById(
      req.params.evaluationId
    );

    if (!evaluation) {
      return res.status(404).send('Evaluation not found');
    }

    if (evaluation.judge.toString() !== req.user._id.toString()) {
      return res.status(403).send(
        'You can only correct your own evaluation'
      );
    }

    if (evaluation.correctionUsed) {
      return res.status(400).send(
        'You have already corrected this evaluation'
      );
    }

    const competitor = await Competitor.findById(evaluation.competitor);

    if (!competitor) {
      return res.status(404).send('Competitor not found');
    }

    const scoringGroups = await ScoringGroup.find();

    res.render('evaluations/correct', {
      evaluation: evaluation,
      competitor: competitor,
      scoringGroups: scoringGroups
    });
  } catch (error) {
    console.log(error);
    res.status(500).send('Error loading correction form');
  }
}

// Correct an evaluation once
async function correctEvaluation(req, res) {
  if (req.user.role !== 'judge') {
    return res.status(403).send('Access denied');
  }

  try {
    const evaluation = await Evaluation.findById(
      req.params.evaluationId
    );

    if (!evaluation) {
      return res.status(404).send('Evaluation not found');
    }

    if (evaluation.judge.toString() !== req.user._id.toString()) {
      return res.status(403).send(
        'You can only correct your own evaluation'
      );
    }

    if (evaluation.correctionUsed) {
      return res.status(400).send(
        'You have already corrected this evaluation'
      );
    }

    const correctionComment = req.body.correctionComment;

    if (!correctionComment || !correctionComment.trim()) {
      return res.status(400).send(
        'Please provide a reason for correcting the evaluation'
      );
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

    evaluation.criterionScores = criterionScores;
    evaluation.correctionUsed = true;
    evaluation.correctionComment = correctionComment.trim();
    evaluation.correctedAt = new Date();

    await evaluation.save();

    req.session.successMessage = 'Evaluation corrected successfully!';

    res.redirect('/evaluations/results');
  } catch (error) {
    console.log(error);
    res.status(500).send('Error correcting evaluation');
  }
}

module.exports = {
  showEvaluationForm,
  saveEvaluation,
  showCorrectionForm,
  correctEvaluation
};