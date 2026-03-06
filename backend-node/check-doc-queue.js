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

const documentQueue = new Queue('document-processing', {
  redis: getRedisConfig(),
});

const checkDocQueue = async () => {
  try {
    const [waiting, active, completed, failed] = await Promise.all([
      documentQueue.getWaitingCount(),
      documentQueue.getActiveCount(),
      documentQueue.getCompletedCount(),
      documentQueue.getFailedCount(),
    ]);

    console.log('\n📊 Document Processing Queue Status:');
    console.log(`   Waiting: ${waiting}`);
    console.log(`   Active: ${active}`);
    console.log(`   Completed: ${completed}`);
    console.log(`   Failed: ${failed}`);

    // Get active jobs
    const activeJobs = await documentQueue.getActive();
    if (activeJobs.length > 0) {
      console.log('\n⏳ Active Jobs:');
      for (const job of activeJobs) {
        console.log(`   Job ID: ${job.id} - Document: ${job.data.documentId}`);
      }
    }

    // Get failed jobs
    const failedJobs = await documentQueue.getFailed(0, 5);
    if (failedJobs.length > 0) {
      console.log('\n❌ Failed Jobs:');
      for (const job of failedJobs) {
        console.log(`   Job ID: ${job.id}`);
        console.log(`   Document ID: ${job.data.documentId}`);
        console.log(`   Error: ${job.failedReason}`);
      }
    }

    await documentQueue.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkDocQueue();
