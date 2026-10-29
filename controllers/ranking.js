const Competitor = require('../models/Competitor');
const Evaluation = require('../models/Evaluation');
const User = require('../models/User');

async function showRanking(req, res) {
  if (req.user.role !== 'admin') {
    req.session.errorMessage = 'Access denied.';
    return res.redirect('/judge');
  }

  try {
    const competitors = await Competitor.find().sort({ name: 1 });
    const judges = await User.find({ role: 'judge' });
    const evaluations = await Evaluation.find();

    const categories = ['Appetizer', 'Main Course', 'Dessert'];
    const ranking = [];

    for (const competitor of competitors) {
      const competitorEvaluations = evaluations.filter(
        (evaluation) =>
          evaluation.competitor.toString() === competitor._id.toString()
      );

      const categoryAverages = {
        Appetizer: null,
        'Main Course': null,
        Dessert: null
      };

      for (const category of categories) {
        const categoryEvaluations = competitorEvaluations.filter(
          (evaluation) => evaluation.dishCategory === category
        );

        if (categoryEvaluations.length > 0) {
          const totalAverage = categoryEvaluations.reduce(
            (sum, evaluation) => {
              const averageTotal = evaluation.criterionScores.reduce(
                (scoreSum, score) => scoreSum + score.points,
                0
              );

              return sum + averageTotal;
            },
            0
          );

          categoryAverages[category] = Number(
            (totalAverage / categoryEvaluations.length).toFixed(2)
          );
        }
      }

      const submittedEvaluations = competitorEvaluations.length;
      const expectedEvaluations = judges.length * categories.length;

      const complete =
        judges.length > 0 &&
        submittedEvaluations === expectedEvaluations &&
        categories.every(
          (category) => categoryAverages[category] !== null
        );

      let finalScore = null;

      if (complete) {
        const totalAverage =
          categoryAverages.Appetizer +
          categoryAverages['Main Course'] +
          categoryAverages.Dessert;

        finalScore = Number(
          (totalAverage / judges.length).toFixed(2)
        );
      }

      ranking.push({
        competitor,
        appetizer: categoryAverages.Appetizer,
        mainCourse: categoryAverages['Main Course'],
        dessert: categoryAverages.Dessert,
        finalScore,
        submittedEvaluations,
        expectedEvaluations,
        complete
      });
    }

    ranking.sort((a, b) => {
      if (a.complete !== b.complete) {
        return a.complete ? -1 : 1;
      }

      if (!a.complete) {
        return a.competitor.name.localeCompare(b.competitor.name);
      }

      return b.finalScore - a.finalScore;
    });

    let currentRank = 0;
    let previousScore = null;

    ranking.forEach((item, index) => {
      if (!item.complete) {
        item.rank = '-';
      } else {
        if (item.finalScore !== previousScore) {
          currentRank = index + 1;
        }

        item.rank = currentRank;
        previousScore = item.finalScore;
      }
    });

    const errorMessage = req.session.errorMessage;
    delete req.session.errorMessage;

    res.render('admin/ranking', {
      ranking,
      judgeCount: judges.length,
      errorMessage
    });
  } catch (error) {
    console.log(error);
    res.status(500).send('Error loading final ranking.');
  }
}

module.exports = {
  showRanking
};
