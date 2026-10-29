const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const User = require('../models/User');

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const existingAdmin = await User.findOne({ username: 'admin' });

    if (existingAdmin) {
      console.log('Admin user already exists.');
      return;
    }

    const passwordHash = await bcrypt.hash('Admin123!', 10);

    const admin = new User({
      username: 'admin',
      passwordHash: passwordHash,
      role: 'admin'
    });

    await admin.save();

    console.log('Admin user created successfully.');
    console.log('Username: admin');
    console.log('Password: Admin123!');
  } catch (error) {
    res.send(error.message)
    console.log(error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

createAdmin();
