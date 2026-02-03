import Answer from '../models/Answer.js';
import GroundTruth from '../models/GroundTruth.js';
import Question from '../models/Question.js';

/**
 * Calculate similarity between two strings (simple Jaccard similarity)
 */
const calculateSimilarity = (str1, str2) => {
  const words1 = new Set(
    str1
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
  );
  const words2 = new Set(
    str2
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
  );

  const intersection = new Set([...words1].filter((x) => words2.has(x)));
  const union = new Set([...words1, ...words2]);

  return intersection.size / union.size;
};

/**
 * Calculate Levenshtein distance
 */
const levenshteinDistance = (str1, str2) => {
  const m = str1.length;
  const n = str2.length;
  const dp = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  return dp[m][n];
};

/**
 * Evaluate a single answer against ground truth
 */
export const evaluateAnswer = async (answerId) => {
  try {
    const answer = await Answer.findById(answerId).populate('question');

    if (!answer) {
      throw new Error('Answer not found');
    }

    const groundTruth = await GroundTruth.findOne({
      question: answer.question._id,
    });

    if (!groundTruth) {
      throw new Error('Ground truth not found for this question');
    }

    const generatedAnswer = answer.finalAnswer || answer.generatedAnswer;
    const correctAnswer = groundTruth.correctAnswer;

    // Calculate metrics
    const jaccardSimilarity = calculateSimilarity(
      generatedAnswer,
      correctAnswer
    );

    const distance = levenshteinDistance(generatedAnswer, correctAnswer);
    const maxLength = Math.max(generatedAnswer.length, correctAnswer.length);
    const normalizedDistance = maxLength > 0 ? distance / maxLength : 0;
    const levenshteinSimilarity = 1 - normalizedDistance;

    // Average similarity score
    const similarityScore = (jaccardSimilarity + levenshteinSimilarity) / 2;

    // Check exact match
    const exactMatch =
      generatedAnswer.toLowerCase().trim() ===
      correctAnswer.toLowerCase().trim();

    // Check if answer contains key information
    const containsKeyInfo = correctAnswer
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 3)
      .every((word) => generatedAnswer.toLowerCase().includes(word));

    return {
      answerId: answer._id,
      questionId: answer.question._id,
      questionText: answer.question.questionText,
      generatedAnswer,
      correctAnswer,
      metrics: {
        similarityScore,
        jaccardSimilarity,
        levenshteinSimilarity,
        exactMatch,
        containsKeyInfo,
        confidenceScore: answer.confidenceScore,
      },
      passed: similarityScore >= 0.7 || containsKeyInfo,
    };
  } catch (error) {
    console.error('Error evaluating answer:', error);
    throw error;
  }
};

/**
 * Evaluate all answers in a questionnaire
 */
export const evaluateQuestionnaire = async (questionnaireId) => {
  try {
    const answers = await Answer.find({
      questionnaire: questionnaireId,
      status: { $in: ['generated', 'reviewed', 'approved'] },
    }).populate('question');

    if (answers.length === 0) {
      throw new Error('No answers found for evaluation');
    }

    const results = {
      total: answers.length,
      evaluated: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      evaluations: [],
      summary: {
        averageSimilarity: 0,
        averageConfidence: 0,
        exactMatches: 0,
        containsKeyInfo: 0,
      },
    };

    let totalSimilarity = 0;
    let totalConfidence = 0;

    for (const answer of answers) {
      try {
        const evaluation = await evaluateAnswer(answer._id);
        results.evaluated++;

        if (evaluation.passed) {
          results.passed++;
        } else {
          results.failed++;
        }

        results.evaluations.push(evaluation);

        totalSimilarity += evaluation.metrics.similarityScore;
        totalConfidence += evaluation.metrics.confidenceScore;

        if (evaluation.metrics.exactMatch) {
          results.summary.exactMatches++;
        }

        if (evaluation.metrics.containsKeyInfo) {
          results.summary.containsKeyInfo++;
        }
      } catch (error) {
        results.skipped++;
        results.evaluations.push({
          answerId: answer._id,
          questionId: answer.question._id,
          questionText: answer.question.questionText,
          error: error.message,
          passed: false,
        });
      }
    }

    // Calculate averages
    if (results.evaluated > 0) {
      results.summary.averageSimilarity = totalSimilarity / results.evaluated;
      results.summary.averageConfidence = totalConfidence / results.evaluated;
    }

    results.summary.passRate =
      results.total > 0 ? results.passed / results.total : 0;

    return results;
  } catch (error) {
    console.error('Error evaluating questionnaire:', error);
    throw error;
  }
};

/**
 * Create or update ground truth
 */
export const setGroundTruth = async (questionId, correctAnswer, source = '') => {
  try {
    let groundTruth = await GroundTruth.findOne({ question: questionId });

    if (groundTruth) {
      groundTruth.correctAnswer = correctAnswer;
      groundTruth.source = source;
    } else {
      groundTruth = new GroundTruth({
        question: questionId,
        correctAnswer,
        source,
      });
    }

    await groundTruth.save();

    return groundTruth;
  } catch (error) {
    console.error('Error setting ground truth:', error);
    throw error;
  }
};

export default {
  evaluateAnswer,
  evaluateQuestionnaire,
  setGroundTruth,
};
