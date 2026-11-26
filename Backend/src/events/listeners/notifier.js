const eventBus = require('../eventBus');
const EVENT_NAMES = require('../eventNames');
const Notification = require('../../models/Notification');
const User = require('../../models/User');
const { ROLES } = require('../../constants/roles');

const registerNotifier = () => {
  // 1. Ticket Created -> Notify Admins
  eventBus.on(EVENT_NAMES.TICKET_CREATED, async ({ ticket, actor }) => {
    try {
      const admins = await User.find({ role: ROLES.ADMIN, isActive: true }).select('_id');
      const notifications = admins.map((admin) => ({
        recipient: admin._id,
        ticket: ticket._id,
        type: 'TICKET_CREATED',
        title: `New Ticket: ${ticket.ticketNumber}`,
        message: `${actor.name || 'A customer'} submitted a new ticket: "${ticket.title}"`,
      }));

      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }
    } catch (err) {
      console.error('[Notifier Error] ticket.created:', err.message);
    }
  });

  // 2. Status Changed -> Notify Ticket Owner
  eventBus.on(EVENT_NAMES.TICKET_STATUS_CHANGED, async ({ ticket, actor, previousStatus, newStatus }) => {
    try {
      // Don't notify if the actor is the owner themselves
      const ownerId = ticket.createdBy._id || ticket.createdBy;
      const actorId = actor._id || actor.id;
      if (ownerId.toString() !== actorId.toString()) {
        await Notification.create({
          recipient: ownerId,
          ticket: ticket._id,
          type: 'STATUS_UPDATED',
          title: `Ticket ${ticket.ticketNumber} Status Updated`,
          message: `Your ticket status is now ${newStatus} (previously ${previousStatus}).`,
        });
      }
    } catch (err) {
      console.error('[Notifier Error] ticket.statusChanged:', err.message);
    }
  });

  // 3. Priority Changed -> Notify Ticket Owner
  eventBus.on(EVENT_NAMES.TICKET_PRIORITY_CHANGED, async ({ ticket, actor, newPriority }) => {
    try {
      const ownerId = ticket.createdBy._id || ticket.createdBy;
      const actorId = actor._id || actor.id;
      if (ownerId.toString() !== actorId.toString()) {
        await Notification.create({
          recipient: ownerId,
          ticket: ticket._id,
          type: 'PRIORITY_UPDATED',
          title: `Ticket ${ticket.ticketNumber} Priority Changed`,
          message: `Priority has been escalated to ${newPriority}.`,
        });
      }
    } catch (err) {
      console.error('[Notifier Error] ticket.priorityChanged:', err.message);
    }
  });

  // 4. Ticket Assigned -> Notify Assigned Admin
  eventBus.on(EVENT_NAMES.TICKET_ASSIGNED, async ({ ticket, assignedToUser }) => {
    try {
      if (assignedToUser) {
        await Notification.create({
          recipient: assignedToUser._id,
          ticket: ticket._id,
          type: 'TICKET_ASSIGNED',
          title: `Ticket ${ticket.ticketNumber} Assigned`,
          message: `You have been assigned to ticket "${ticket.title}".`,
        });
      }
    } catch (err) {
      console.error('[Notifier Error] ticket.assigned:', err.message);
    }
  });

  // 5. Comment Added -> Notify the counter-party
  eventBus.on(EVENT_NAMES.COMMENT_ADDED, async ({ ticket, comment, actor }) => {
    try {
      const ownerId = ticket.createdBy._id || ticket.createdBy;
      const actorId = actor._id || actor.id;
      const notifications = [];

      // If author is the ticket owner, notify assigned admin or all admins
      if (actorId.toString() === ownerId.toString()) {
        if (ticket.assignedTo) {
          notifications.push({
            recipient: ticket.assignedTo,
            ticket: ticket._id,
            type: 'COMMENT_ADDED',
            title: `Customer Response on ${ticket.ticketNumber}`,
            message: `${actor.name || 'Customer'}: "${comment.message.substring(0, 60)}${comment.message.length > 60 ? '...' : ''}"`,
          });
        } else {
          // Notify active admins
          const admins = await User.find({ role: ROLES.ADMIN, isActive: true }).select('_id');
          admins.forEach((admin) => {
            notifications.push({
              recipient: admin._id,
              ticket: ticket._id,
              type: 'COMMENT_ADDED',
              title: `Customer Response on ${ticket.ticketNumber}`,
              message: `${actor.name || 'Customer'}: "${comment.message.substring(0, 60)}..."`,
            });
          });
        }
      } else {
        // Author is an admin, notify ticket owner
        notifications.push({
          recipient: ownerId,
          ticket: ticket._id,
          type: 'COMMENT_ADDED',
          title: `Support Agent Responded to ${ticket.ticketNumber}`,
          message: `${actor.name || 'Support Agent'}: "${comment.message.substring(0, 60)}${comment.message.length > 60 ? '...' : ''}"`,
        });
      }

      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }
    } catch (err) {
      console.error('[Notifier Error] comment.added:', err.message);
    }
  });
};

module.exports = registerNotifier;
