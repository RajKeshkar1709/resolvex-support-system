const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Actor is required'],
      index: true,
    },
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
      required: [true, 'Associated ticket is required'],
      index: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'TICKET_CREATED',
        'TICKET_UPDATED',
        'STATUS_CHANGED',
        'PRIORITY_CHANGED',
        'ASSIGNED_CHANGED',
        'COMMENT_ADDED',
        'TICKET_RESOLVED',
        'TICKET_CLOSED',
      ],
    },
    description: {
      type: String,
      required: true,
    },
    metadata: {
      previousStatus: String,
      newStatus: String,
      previousPriority: String,
      newPriority: String,
      assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      commentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Immutable: no updatedAt
  }
);

activityLogSchema.index({ ticket: 1, createdAt: -1 });
activityLogSchema.index({ actor: 1, createdAt: -1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
module.exports = ActivityLog;
