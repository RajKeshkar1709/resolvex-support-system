const eventBus = require('../eventBus');
const EVENT_NAMES = require('../eventNames');
const ActivityLog = require('../../models/ActivityLog');

const registerActivityLogger = () => {
  // Ticket Created
  eventBus.on(EVENT_NAMES.TICKET_CREATED, async ({ ticket, actor }) => {
    try {
      await ActivityLog.create({
        actor: actor._id || actor.id,
        ticket: ticket._id,
        action: 'TICKET_CREATED',
        description: `Ticket ${ticket.ticketNumber} created by ${actor.name || 'User'}`,
        metadata: {
          newStatus: ticket.status,
          newPriority: ticket.priority,
        },
      });
    } catch (err) {
      console.error('[ActivityLogger Error] ticket.created:', err.message);
    }
  });

  // Ticket Updated
  eventBus.on(EVENT_NAMES.TICKET_UPDATED, async ({ ticket, actor, changes }) => {
    try {
      await ActivityLog.create({
        actor: actor._id || actor.id,
        ticket: ticket._id,
        action: 'TICKET_UPDATED',
        description: `Ticket ${ticket.ticketNumber} details updated`,
        metadata: changes || {},
      });
    } catch (err) {
      console.error('[ActivityLogger Error] ticket.updated:', err.message);
    }
  });

  // Status Changed
  eventBus.on(EVENT_NAMES.TICKET_STATUS_CHANGED, async ({ ticket, actor, previousStatus, newStatus }) => {
    try {
      let action = 'STATUS_CHANGED';
      if (newStatus === 'RESOLVED') action = 'TICKET_RESOLVED';
      if (newStatus === 'CLOSED') action = 'TICKET_CLOSED';

      await ActivityLog.create({
        actor: actor._id || actor.id,
        ticket: ticket._id,
        action,
        description: `Status changed from ${previousStatus} to ${newStatus} by ${actor.name || 'Admin'}`,
        metadata: {
          previousStatus,
          newStatus,
        },
      });
    } catch (err) {
      console.error('[ActivityLogger Error] ticket.statusChanged:', err.message);
    }
  });

  // Priority Changed
  eventBus.on(EVENT_NAMES.TICKET_PRIORITY_CHANGED, async ({ ticket, actor, previousPriority, newPriority }) => {
    try {
      await ActivityLog.create({
        actor: actor._id || actor.id,
        ticket: ticket._id,
        action: 'PRIORITY_CHANGED',
        description: `Priority updated from ${previousPriority} to ${newPriority}`,
        metadata: {
          previousPriority,
          newPriority,
        },
      });
    } catch (err) {
      console.error('[ActivityLogger Error] ticket.priorityChanged:', err.message);
    }
  });

  // Assigned Changed
  eventBus.on(EVENT_NAMES.TICKET_ASSIGNED, async ({ ticket, actor, assignedToUser }) => {
    try {
      await ActivityLog.create({
        actor: actor._id || actor.id,
        ticket: ticket._id,
        action: 'ASSIGNED_CHANGED',
        description: `Ticket assigned to ${assignedToUser ? assignedToUser.name : 'Unassigned'}`,
        metadata: {
          assignedTo: assignedToUser ? assignedToUser._id : null,
        },
      });
    } catch (err) {
      console.error('[ActivityLogger Error] ticket.assigned:', err.message);
    }
  });

  // Comment Added
  eventBus.on(EVENT_NAMES.COMMENT_ADDED, async ({ ticket, comment, actor }) => {
    try {
      await ActivityLog.create({
        actor: actor._id || actor.id,
        ticket: ticket._id,
        action: 'COMMENT_ADDED',
        description: `New comment posted by ${actor.name || 'User'}`,
        metadata: {
          commentId: comment._id,
        },
      });
    } catch (err) {
      console.error('[ActivityLogger Error] comment.added:', err.message);
    }
  });
};

module.exports = registerActivityLogger;
