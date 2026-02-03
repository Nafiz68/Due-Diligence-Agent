import mongoose from 'mongoose';

const groundTruthSchema = new mongoose.Schema(
  {
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
    },
    correctAnswer: {
      type: String,
      required: true,
    },
    source: {
      type: String,
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

groundTruthSchema.index({ question: 1 });

const GroundTruth = mongoose.model('GroundTruth', groundTruthSchema);

export default GroundTruth;
