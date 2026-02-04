import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
    },
    sender: {
      type: String,
      enum: ['user', 'assistant'],
      required: true,
    },
    response: {
      type: String,
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
    confidenceScore: {
      type: Number,
      min: 0,
      max: 1,
    },
    metadata: {
      tokensUsed: Number,
      processingTimeMs: Number,
    },
  },
  {
    timestamps: true,
  }
);

const chatSessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      default: 'Chat Session',
    },
    messages: [chatMessageSchema],
    questionnaire: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Questionnaire',
    },
    context: {
      type: String,
      description: 'Optional context about what the chat is related to',
    },
    status: {
      type: String,
      enum: ['active', 'archived', 'closed'],
      default: 'active',
    },
    userId: {
      type: String,
      description: 'User identifier',
    },
  },
  {
    timestamps: true,
  }
);

chatSessionSchema.index({ userId: 1 });
chatSessionSchema.index({ questionnaire: 1 });

const Chat = mongoose.model('Chat', chatSessionSchema);

export default Chat;
