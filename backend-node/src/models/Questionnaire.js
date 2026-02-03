import mongoose from 'mongoose';

const questionnaireSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
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
      enum: ['csv', 'xlsx', 'xls', 'pdf'],
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    questionCount: {
      type: Number,
      default: 0,
    },
    answeredCount: {
      type: Number,
      default: 0,
    },
    error: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

questionnaireSchema.index({ name: 1 });
questionnaireSchema.index({ status: 1 });

const Questionnaire = mongoose.model('Questionnaire', questionnaireSchema);

export default Questionnaire;
