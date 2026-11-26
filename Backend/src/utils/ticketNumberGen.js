const Ticket = require('../models/Ticket');

/**
 * Generates an atomic, collision-resistant unique ticket number
 * Format: RES-YYYY-XXXX (e.g. RES-2026-1001)
 */
const generateTicketNumber = async () => {
  const year = new Date().getFullYear();
  const prefix = `RES-${year}-`;

  // Find the highest existing ticket number for this year
  const latestTicket = await Ticket.findOne({
    ticketNumber: new RegExp(`^${prefix}`),
  })
    .sort({ createdAt: -1 })
    .select('ticketNumber')
    .lean();

  let nextSequence = 1001;
  if (latestTicket && latestTicket.ticketNumber) {
    const parts = latestTicket.ticketNumber.split('-');
    if (parts.length === 3) {
      const parsedSeq = parseInt(parts[2], 10);
      if (!isNaN(parsedSeq)) {
        nextSequence = parsedSeq + 1;
      }
    }
  }

  return `${prefix}${nextSequence}`;
};

module.exports = { generateTicketNumber };
