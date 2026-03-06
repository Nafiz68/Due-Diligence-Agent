import Queue from 'bull';
import dotenv from 'dotenv';
import connectDB from './src/config/database.js';
import Document from './src/models/Document.js';

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

const reprocessDocuments = async () => {
  try {
    await connectDB();

    // Get all documents
    const documents = await Document.find();
    
    console.log(`\n📄 Found ${documents.length} documents to reprocess`);

    // Clear any existing jobs
    await documentQueue.clean(0, 'completed');
    await documentQueue.clean(0, 'failed');
    await documentQueue.empty();

    // Add reprocessing jobs
    for (const doc of documents) {
      console.log(`   Adding job for: ${doc.filename}`);
      await documentQueue.add(
        { documentId: doc._id.toString() },
        {
          attempts: 2,
          backoff: { type: 'exponential', delay: 2000 },
          removeOnComplete: false,
        }
      );
    }

    console.log(`\n✅ Added ${documents.length} document processing jobs to queue`);
    console.log('   The worker will process them automatically');

    await documentQueue.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

reprocessDocuments();
