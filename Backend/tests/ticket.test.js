const request = require('supertest');
const app = require('../src/app');
const { connectTestDB, closeTestDB, clearTestDB } = require('./setup');
const User = require('../src/models/User');
const Ticket = require('../src/models/Ticket');
const ActivityLog = require('../src/models/ActivityLog');
const Notification = require('../src/models/Notification');
const { ROLES } = require('../src/constants/roles');

beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

describe('ResolveX Ticket Lifecycle, RBAC & Event-Driven Audit Suite', () => {
  let userCookie;
  let adminCookie;
  let user;
  let admin;

  beforeEach(async () => {
    // 1. Create User
    await request(app).post('/api/auth/register').send({
      name: 'Customer Bob',
      email: 'bob@example.com',
      password: 'Password123',
    });

    const userLogin = await request(app).post('/api/auth/login').send({
      email: 'bob@example.com',
      password: 'Password123',
    });
    userCookie = userLogin.headers['set-cookie'];
    user = await User.findOne({ email: 'bob@example.com' });

    // 2. Create Admin directly via model (simulating secure admin seed)
    admin = await User.create({
      name: 'Super Admin',
      email: 'admin@resolvex.com',
      password: 'AdminPassword123',
      role: ROLES.ADMIN,
    });

    const adminLogin = await request(app).post('/api/auth/login').send({
      email: 'admin@resolvex.com',
      password: 'AdminPassword123',
    });
    adminCookie = adminLogin.headers['set-cookie'];
  });

  it('should allow user to create ticket and trigger event bus activity log and admin notification', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .set('Cookie', userCookie)
      .send({
        title: 'Checkout API 500 Failure',
        description: 'Unable to purchase products due to timeout',
        category: 'TECHNICAL',
        priority: 'HIGH',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.ticketNumber).toMatch(/^RES-\d{4}-\d+/);

    const ticketId = res.body.data._id;

    // Small delay for asynchronous EventEmitter listeners to finish saving
    await new Promise((r) => setTimeout(r, 200));

    // Verify ActivityLog was created
    const log = await ActivityLog.findOne({ ticket: ticketId });
    expect(log).toBeDefined();
    expect(log.action).toBe('TICKET_CREATED');

    // Verify Notification was dispatched to the Admin
    const notif = await Notification.findOne({ recipient: admin._id });
    expect(notif).toBeDefined();
    expect(notif.type).toBe('TICKET_CREATED');
  });

  it('should prevent user from accessing administrative endpoints', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard/stats')
      .set('Cookie', userCookie);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('should enforce state machine: OPEN -> IN_PROGRESS -> RESOLVED -> CLOSED', async () => {
    // Customer creates ticket
    const ticketRes = await request(app)
      .post('/api/tickets')
      .set('Cookie', userCookie)
      .send({
        title: 'Database connection delay',
        description: 'Latency over 2000ms',
        category: 'TECHNICAL',
        priority: 'MEDIUM',
      });

    const ticketId = ticketRes.body.data._id;

    // Admin updates OPEN -> IN_PROGRESS
    const progressRes = await request(app)
      .patch(`/api/admin/tickets/${ticketId}/status`)
      .set('Cookie', adminCookie)
      .send({ status: 'IN_PROGRESS' });

    expect(progressRes.status).toBe(200);
    expect(progressRes.body.data.status).toBe('IN_PROGRESS');

    // Invalid transition: IN_PROGRESS cannot jump straight to CLOSED (must be RESOLVED first)
    const invalidRes = await request(app)
      .patch(`/api/admin/tickets/${ticketId}/status`)
      .set('Cookie', adminCookie)
      .send({ status: 'CLOSED' });

    expect(invalidRes.status).toBe(400);

    // Valid transition: IN_PROGRESS -> RESOLVED
    const resolveRes = await request(app)
      .patch(`/api/admin/tickets/${ticketId}/status`)
      .set('Cookie', adminCookie)
      .send({ status: 'RESOLVED' });

    expect(resolveRes.status).toBe(200);
    expect(resolveRes.body.data.status).toBe('RESOLVED');
    expect(resolveRes.body.data.resolvedAt).toBeDefined();
  });

  it('should allow user and admin to add comments and record audit trail', async () => {
    const ticketRes = await request(app)
      .post('/api/tickets')
      .set('Cookie', userCookie)
      .send({
        title: 'Need account invoice',
        description: 'Invoice for February 2026',
        category: 'BILLING',
        priority: 'LOW',
      });

    const ticketId = ticketRes.body.data._id;

    // Admin comments
    const commentRes = await request(app)
      .post(`/api/tickets/${ticketId}/comments`)
      .set('Cookie', adminCookie)
      .send({ message: 'Hello Bob, invoice has been sent to your email.' });

    expect(commentRes.status).toBe(201);
    expect(commentRes.body.data.message).toContain('invoice has been sent');

    // Small delay for event listener
    await new Promise((r) => setTimeout(r, 200));

    // User should have received a notification
    const userNotif = await Notification.findOne({ recipient: user._id, type: 'COMMENT_ADDED' });
    expect(userNotif).toBeDefined();
  });
});
