const request = require('supertest');
const app = require('../src/app');
const { connectTestDB, closeTestDB, clearTestDB } = require('./setup');
const User = require('../src/models/User');
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

describe('ResolveX Auth & Role RBAC Suite', () => {
  it('should successfully register a new customer with USER role by default', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Alice Johnson',
      email: 'alice@example.com',
      password: 'Password123!',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.role).toBe(ROLES.USER);

    // Verify in database that password is not plain text
    const savedUser = await User.findOne({ email: 'alice@example.com' }).select('+password');
    expect(savedUser.password).not.toBe('Password123!');
  });

  it('should reject registration with duplicate email address', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Alice',
      email: 'alice@example.com',
      password: 'Password123!',
    });

    const duplicateRes = await request(app).post('/api/auth/register').send({
      name: 'Alice Two',
      email: 'alice@example.com',
      password: 'AnotherPassword123!',
    });

    expect(duplicateRes.status).toBe(409);
    expect(duplicateRes.body.success).toBe(false);
  });

  it('should login user and set HttpOnly access and refresh token cookies', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Alice',
      email: 'alice@example.com',
      password: 'Password123!',
    });

    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'alice@example.com',
      password: 'Password123!',
    });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.success).toBe(true);

    const cookies = loginRes.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies.some((c) => c.startsWith('accessToken='))).toBe(true);
    expect(cookies.some((c) => c.startsWith('refreshToken='))).toBe(true);
  });

  it('should reject login with incorrect credentials', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Alice',
      email: 'alice@example.com',
      password: 'Password123!',
    });

    const res = await request(app).post('/api/auth/login').send({
      email: 'alice@example.com',
      password: 'WrongPassword!',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
