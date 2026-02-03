import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
      enum: ['pdf'],
    },
    fileSize: {
      type: Number,
      required: true,
    },
    extractedText: {
      type: String,
      default: '',
    },
    chunks: [
      {
        text: String,
        chunkIndex: Number,
        vectorId: String,
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    error: {
      type: String,
    },
    metadata: {
      pageCount: Number,
      author: String,
      subject: String,
      createdDate: Date,
    },
  },
  {
    timestamps: true,
  }
);

documentSchema.index({ filename: 1 });
documentSchema.index({ status: 1 });

const Document = mongoose.model('Document', documentSchema);

export default Document;
