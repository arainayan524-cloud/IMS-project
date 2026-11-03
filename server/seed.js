import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import User from './models/Users.js';
import connectDB from './db/connection.js';

const register = async () => {
  try {
    await connectDB();
    const hashedPassword = await bcrypt.hash('admin123', 10);

    await User.findOneAndUpdate(
      { email: 'admin@gmail.com' },
      {
        $set: {
          email: 'admin@gmail.com',
          name: 'Admin',
          password: hashedPassword,
          address: '123 Admin St',
          role: 'admin'
        }
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true
      }
    );

    console.log('Admin user created successfully');
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
  }
};

await register();