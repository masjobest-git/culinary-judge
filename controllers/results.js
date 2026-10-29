const Competitor = require('../models/Competitor');
const Evaluation = require('../models/Evaluation');
const ScoringGroup = require('../models/ScoringGroup');

async function showResults(req, res) {
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

        // Find the current judge's evaluation
        const myEvaluation = categoryEvaluations.find(
          (evaluation) =>
            evaluation.judge.toString() === req.user._id.toString()
        );

        // Show only the current judge's scores
        const groupResults = [];

        for (const group of scoringGroups) {
          let groupTotal = null;

          if (myEvaluation) {
            const groupScores = myEvaluation.criterionScores.filter((score) =>
              score.scoringGroup &&
              score.scoringGroup._id.toString() === group._id.toString()
            );

            if (groupScores.length > 0) {
              groupTotal = groupScores.reduce(
                (sum, score) => sum + score.points,
                0
              );
            }
          }

          groupResults.push({
            name: group.name,
            average: groupTotal
          });
        }

        let myAverageTotal = null;

        if (myEvaluation) {
          const totalPoints = myEvaluation.criterionScores.reduce(
            (sum, score) => sum + score.points,
            0
          );

          myAverageTotal = Number(totalPoints.toFixed(2));
        }

        results.push({
          competitor: competitor,
          category: category,
          judgeCount: categoryEvaluations.length,
          groups: groupResults,
          averageTotal: myAverageTotal,
          myEvaluation: myEvaluation || null
        });
      }
    }

    res.render('judge/results', {
      results: results,
      successMessage: req.session.successMessage
    });

    delete req.session.successMessage;

  } catch (error) {
    console.log(error);
    res.status(500).send('Error loading results');
  }
}

module.exports = {
  showResults
};
