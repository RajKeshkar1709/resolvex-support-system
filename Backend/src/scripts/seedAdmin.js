const mongoose = require('mongoose');
const User = require('../models/User');
const { ROLES } = require('../constants/roles');
const connectDB = require('../config/db');
const config = require('../config/environment');

const seedAdmin = async () => {
  try {
    console.log('[Seed] Connecting to database...');
    await connectDB(config.MONGODB_URI);

    const existingAdmin = await User.findOne({ email: config.ADMIN_EMAIL });
    if (existingAdmin) {
      console.log(`[Seed] Admin already exists: ${existingAdmin.email} (Role: ${existingAdmin.role})`);
      process.exit(0);
    }

    const admin = await User.create({
      name: config.ADMIN_NAME,
      email: config.ADMIN_EMAIL,
      password: config.ADMIN_PASSWORD,
      role: ROLES.ADMIN,
      isActive: true,
    });

    console.log(`[Seed SUCCESS] Admin account created successfully:`);
    console.log(`Email: ${admin.email}`);
    console.log(`Role: ${admin.role}`);
    console.log(`Password: ${config.ADMIN_PASSWORD}`);
    process.exit(0);
  } catch (error) {
    console.error(`[Seed ERROR]:`, error.message);
    process.exit(1);
  }
};

seedAdmin();
