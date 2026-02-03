import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema(
  {
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
    },
    questionnaire: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Questionnaire',
      required: true,
    },
    generatedAnswer: {
      type: String,
      required: true,
    },
    finalAnswer: {
      type: String,
    },
    confidenceScore: {
      type: Number,
      min: 0,
      max: 1,
      default: 0,
    },
    citations: [
      {
        documentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Document',
        },
        documentName: String,
        chunkText: String,
        relevanceScore: Number,
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'generated', 'reviewed', 'approved'],
      default: 'pending',
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    reviewNotes: {
      type: String,
    },
    reviewedBy: {
      type: String,
    },
    reviewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

answerSchema.index({ question: 1 });
answerSchema.index({ questionnaire: 1 });
answerSchema.index({ status: 1 });

const Answer = mongoose.model('Answer', answerSchema);

export default Answer;
