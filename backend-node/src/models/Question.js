import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    questionnaire: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Questionnaire',
      required: true,
    },
    questionText: {
      type: String,
      required: true,
    },
    questionNumber: {
      type: String,
    },
    category: {
      type: String,
    },
    subcategory: {
      type: String,
    },
    expectedAnswerType: {
      type: String,
      enum: ['text', 'yes_no', 'multiple_choice', 'numeric', 'date'],
      default: 'text',
    },
    isRequired: {
      type: Boolean,
      default: false,
    },
    metadata: {
      type: Map,
      of: String,
    },
  },
  {
    timestamps: true,
  }
);

questionSchema.index({ questionnaire: 1, questionNumber: 1 });
questionSchema.index({ category: 1 });

const Question = mongoose.model('Question', questionSchema);

export default Question;
