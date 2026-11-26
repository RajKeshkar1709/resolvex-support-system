const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
      required: [true, 'Ticket reference is required'],
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    message: {
      type: String,
      required: [true, 'Comment message is required'],
      trim: true,
    },
    attachments: [
      {
        fileName: String,
        fileUrl: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index to retrieve conversation chronologically
commentSchema.index({ ticket: 1, createdAt: 1 });

const Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment;
