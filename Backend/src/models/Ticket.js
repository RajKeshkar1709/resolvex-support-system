const mongoose = require('mongoose');
const {
  TICKET_STATUS,
  TICKET_PRIORITY,
  TICKET_CATEGORY,
} = require('../constants/ticketStatus');

const ticketSchema = new mongoose.Schema(
  {
    ticketNumber: {
      type: String,
      required: [true, 'Ticket number is required'],
      unique: true,
      index: true,
      uppercase: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: Object.values(TICKET_CATEGORY),
      index: true,
    },
    priority: {
      type: String,
      required: [true, 'Priority is required'],
      enum: Object.values(TICKET_PRIORITY),
      default: TICKET_PRIORITY.MEDIUM,
      index: true,
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: Object.values(TICKET_STATUS),
      default: TICKET_STATUS.OPEN,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Ticket creator is required'],
      index: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    attachments: [
      {
        fileName: String,
        fileUrl: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    resolvedAt: {
      type: Date,
      default: null,
    },
    closedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound text index for title & description search
ticketSchema.index({ title: 'text', description: 'text' });
// Compound index for listing creator's tickets by creation date
ticketSchema.index({ createdBy: 1, createdAt: -1 });

const Ticket = mongoose.model('Ticket', ticketSchema);
module.exports = Ticket;
