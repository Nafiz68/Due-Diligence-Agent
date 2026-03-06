import Queue from 'bull';
import dotenv from 'dotenv';

dotenv.config();

const getRedisConfig = () => {
  if (process.env.REDIS_URL) {
    return process.env.REDIS_URL;
  }
  return {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
  };
};

const answerQueue = new Queue('answer-generation', {
  redis: getRedisConfig(),
});

const checkQueue = async () => {
  try {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      answerQueue.getWaitingCount(),
      answerQueue.getActiveCount(),
      answerQueue.getCompletedCount(),
      answerQueue.getFailedCount(),
      answerQueue.getDelayedCount(),
    ]);

    console.log('\n📊 Answer Generation Queue Status:');
    console.log(`   Waiting: ${waiting}`);
    console.log(`   Active: ${active}`);
    console.log(`   Completed: ${completed}`);
    console.log(`   Failed: ${failed}`);
    console.log(`   Delayed: ${delayed}`);

    // Get some failed jobs to see errors
    const failedJobs = await answerQueue.getFailed(0, 10);
    if (failedJobs.length > 0) {
      console.log('\n❌ Recent Failed Jobs:');
      for (const job of failedJobs) {
        console.log(`\n   Job ID: ${job.id}`);
        console.log(`   Question ID: ${job.data.questionId || job.data.questionnaireId}`);
        console.log(`   Attempt: ${job.attemptsMade}/${job.opts.attempts || 1}`);
        console.log(`   Error: ${job.failedReason}`);
        if (job.stacktrace && job.stacktrace.length > 0) {
          console.log(`   Stack: ${job.stacktrace[0].substring(0, 200)}`);
        }
      }
    }

    await answerQueue.close();
    process.exit(0);
  } catch (error) {
    console.error('Error checking queue:', error);
    process.exit(1);
  }
};

checkQueue();
