import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User.js';
import { Project } from '../models/Project.js';
import { Timesheet } from '../models/Timesheet.js';
import { Notification } from '../models/Notification.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/workzen_db';

export const initDefaultAdmin = async () => {
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@workzen.io').toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
  const adminName = process.env.ADMIN_NAME || 'Workzen Administrator';

  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    const admin = await User.create({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
      department: 'Executive Operations',
      designation: 'System Administrator',
      hourlyRate: 75,
      status: 'active',
    });
    console.log(`[Production] Default Admin initialized: ${admin.email}`);
    return admin;
  }
  return existingAdmin;
};

export const clearDummyDataAndInitAdmin = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGODB_URI);
    }
    console.log('[Production Reset] Connected to database...');

    // 1. Wipe all dummy timesheets, projects, notifications
    await Timesheet.deleteMany({});
    await Project.deleteMany({});
    await Notification.deleteMany({});
    console.log('[Production Reset] Cleared all timesheets, projects, and notifications.');

    // 2. Wipe all users
    await User.deleteMany({});
    console.log('[Production Reset] Cleared all previous dummy users.');

    // 3. Create the SINGLE default production admin account
    const admin = await initDefaultAdmin();

    console.log('===========================================================');
    console.log(' ✨ WORKZEN PRODUCTION ENVIRONMENT READY');
    console.log(' All dummy data wiped cleanly.');
    console.log(' Single Default Admin Account Created:');
    console.log(`   Email:    ${admin.email}`);
    console.log(`   Password: ${process.env.ADMIN_PASSWORD || 'Admin@123'}`);
    console.log(`   Role:     ${admin.role}`);
    console.log('===========================================================');

    if (process.argv[1]?.includes('initProduction.js')) {
      process.exit(0);
    }
  } catch (error) {
    console.error('[Production Reset Error]:', error);
    if (process.argv[1]?.includes('initProduction.js')) {
      process.exit(1);
    }
  }
};

if (process.argv[1]?.includes('initProduction.js')) {
  clearDummyDataAndInitAdmin();
}
