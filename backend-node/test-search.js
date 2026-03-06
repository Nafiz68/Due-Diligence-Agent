import dotenv from 'dotenv';
import connectDB from './src/config/database.js';
import { searchDocuments } from './src/services/documentService.js';
import Document from './src/models/Document.js';

dotenv.config();

const testSearch = async () => {
  try {
    await connectDB();

    // Check documents
    const documents = await Document.find().select('filename status chunkCount');
    console.log('\n📄 Documents in MongoDB:');
    for (const doc of documents) {
      console.log(`   ${doc.filename}`);
      console.log(`      ID: ${doc._id}`);
      console.log(`      Status: ${doc.status}`);
      console.log(`      Chunks: ${doc.chunkCount || 0}`);
    }

    // Test ChromaDB search
    console.log('\n🔍 Testing ChromaDB search...');
    try {
      const results = await searchDocuments('company information', 5);
      console.log(`   ✅ ChromaDB is working!`);
      console.log(`   Found ${results.length} results`);
      if (results.length > 0) {
        console.log(`   Sample: ${results[0].text.substring(0, 100)}...`);
      }
    } catch (error) {
      console.log(`   ❌ ChromaDB search failed: ${error.message}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

testSearch();
