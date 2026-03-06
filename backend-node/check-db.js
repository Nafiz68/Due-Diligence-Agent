import dotenv from 'dotenv';
import connectDB from './src/config/database.js';
import Question from './src/models/Question.js';
import Answer from './src/models/Answer.js';
import Questionnaire from './src/models/Questionnaire.js';
import Document from './src/models/Document.js';

dotenv.config();

const checkDatabase = async () => {
  try {
    await connectDB();

    const [questions, answers, questionnaires, documents] = await Promise.all([
      Question.countDocuments(),
      Answer.countDocuments(),
      Questionnaire.find().select('name questionCount answeredCount'),
      Document.countDocuments(),
    ]);

    console.log('\n📊 Database Status:');
    console.log(`   Documents: ${documents}`);
    console.log(`   Questionnaires: ${questionnaires.length}`);
    console.log(`   Total Questions: ${questions}`);
    console.log(`   Total Answers: ${answers}`);

    console.log('\n📋 Questionnaires:');
    for (const q of questionnaires) {
      const qQuestions = await Question.countDocuments({ questionnaire: q._id });
      const qAnswers = await Answer.countDocuments({ questionnaire: q._id });
      console.log(`\n   ${q.name}`);
      console.log(`      ID: ${q._id}`);
      console.log(`      Questions in DB: ${qQuestions} (recorded: ${q.questionCount})`);
      console.log(`      Answers: ${qAnswers} (recorded: ${q.answeredCount || 0})`);
      console.log(`      Pending: ${qQuestions - qAnswers}`);
    }

    // Check answer statuses
    const answerStats = await Answer.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    console.log('\n📈 Answer Status Breakdown:');
    for (const stat of answerStats) {
      console.log(`   ${stat._id}: ${stat.count}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkDatabase();
