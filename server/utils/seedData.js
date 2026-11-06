import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User.js';
import { Project } from '../models/Project.js';
import { Timesheet } from '../models/Timesheet.js';
import { Notification } from '../models/Notification.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/workzen_db';

export const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('[Seeder] Connected to database...');

    // Clear existing collections
    await User.deleteMany({});
    await Project.deleteMany({});
    await Timesheet.deleteMany({});
    await Notification.deleteMany({});
    console.log('[Seeder] Cleaned existing records.');

    // 1. Create Users
    console.log('[Seeder] Creating users...');
    const admin = await User.create({
      name: 'Eleanor Vance (Admin)',
      email: 'admin@workzen.io',
      password: 'Admin@123',
      role: 'admin',
      department: 'Executive Operations',
      designation: 'Director of Workforce Operations',
      hourlyRate: 85,
    });

    const manager1 = await User.create({
      name: 'Sarah Jenkins',
      email: 'manager@workzen.io',
      password: 'Manager@123',
      role: 'manager',
      department: 'Engineering',
      designation: 'Engineering Lead & Project Manager',
      hourlyRate: 65,
    });

    const manager2 = await User.create({
      name: 'Alex Chen',
      email: 'alex.chen@workzen.io',
      password: 'Manager@123',
      role: 'manager',
      department: 'Product & Design',
      designation: 'Principal Product Manager',
      hourlyRate: 60,
    });

    const emp1 = await User.create({
      name: 'David Kim',
      email: 'employee@workzen.io',
      password: 'Employee@123',
      role: 'employee',
      department: 'Engineering',
      designation: 'Senior Frontend Developer',
      hourlyRate: 50,
    });

    const emp2 = await User.create({
      name: 'Priya Patel',
      email: 'priya.patel@workzen.io',
      password: 'Employee@123',
      role: 'employee',
      department: 'Engineering',
      designation: 'Full Stack Engineer',
      hourlyRate: 48,
    });

    const emp3 = await User.create({
      name: 'Marcus Vance',
      email: 'marcus.vance@workzen.io',
      password: 'Employee@123',
      role: 'employee',
      department: 'Product & Design',
      designation: 'Senior UI/UX Specialist',
      hourlyRate: 45,
    });

    const emp4 = await User.create({
      name: 'Elena Rostova',
      email: 'elena.rostova@workzen.io',
      password: 'Employee@123',
      role: 'employee',
      department: 'QA & DevOps',
      designation: 'DevOps & Test Automation Lead',
      hourlyRate: 45,
    });

    console.log('[Seeder] Users created successfully.');

    // 2. Create Projects
    console.log('[Seeder] Creating projects...');
    const proj1 = await Project.create({
      name: 'Workzen Enterprise SaaS Platform',
      code: 'WZ-101',
      clientName: 'Zenith Global Solutions',
      description: 'End-to-end workforce timesheet and productivity management portal with role-based governance.',
      status: 'in-progress',
      priority: 'critical',
      startDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      budgetHours: 240,
      manager: manager1._id,
      assignedEmployees: [emp1._id, emp2._id, emp3._id],
      createdBy: admin._id,
    });

    const proj2 = await Project.create({
      name: 'Mobile Workforce iOS & Android App',
      code: 'WZ-102',
      clientName: 'Apex Mobility Partners',
      description: 'Native mobile client for on-the-go geo-tagged clock in/out, real-time hours logging, and push alerts.',
      status: 'in-progress',
      priority: 'high',
      startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      budgetHours: 160,
      manager: manager1._id,
      assignedEmployees: [emp1._id, emp4._id],
      createdBy: manager1._id,
    });

    const proj3 = await Project.create({
      name: 'Cloud Infrastructure & Kubernetes CI/CD',
      code: 'WZ-103',
      clientName: 'Internal TechOps',
      description: 'High-availability microservice clusters, automated blue-green deployments, and Prometheus monitoring.',
      status: 'in-progress',
      priority: 'medium',
      startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      budgetHours: 100,
      manager: manager2._id,
      assignedEmployees: [emp2._id, emp4._id],
      createdBy: admin._id,
    });

    const proj4 = await Project.create({
      name: 'AI Automated Invoicing Engine',
      code: 'WZ-104',
      clientName: 'Finovate Systems',
      description: 'Smart invoice generation directly from approved timesheet entries with tax rules and Stripe integration.',
      status: 'planning',
      priority: 'high',
      startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      budgetHours: 120,
      manager: manager2._id,
      assignedEmployees: [emp2._id, emp3._id],
      createdBy: admin._id,
    });

    const proj5 = await Project.create({
      name: 'Customer Billing Portal v2.0',
      code: 'WZ-105',
      clientName: 'BlueSky Logistics',
      description: 'Legacy customer self-service billing upgrade with live usage telemetry and PDF exports.',
      status: 'completed',
      priority: 'medium',
      startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      budgetHours: 80,
      manager: manager1._id,
      assignedEmployees: [emp1._id, emp2._id],
      createdBy: admin._id,
    });

    console.log('[Seeder] Projects created successfully.');

    // 3. Create Realistic Timesheets
    console.log('[Seeder] Creating timesheets...');
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;

    const timesheetsData = [
      // Approved timesheets for David Kim (emp1)
      {
        user: emp1._id,
        project: proj1._id,
        taskTitle: 'Implemented Role-Based Auth & Session Management',
        description: 'Set up JWT authentication, refresh cookie handling, and route protections for Admin/Manager/Employee views.',
        date: new Date(now - 4 * day),
        hours: 8,
        billable: true,
        status: 'approved',
        reviewedBy: manager1._id,
        reviewedAt: new Date(now - 3 * day),
        reviewComment: 'Outstanding delivery. Security headers and tests all pass.',
      },
      {
        user: emp1._id,
        project: proj1._id,
        taskTitle: 'Created Project Management UI with Filterable Grid',
        description: 'Built project cards, status pills, progress calculation bars, and manager assignment dialogs.',
        date: new Date(now - 3 * day),
        hours: 7.5,
        billable: true,
        status: 'approved',
        reviewedBy: manager1._id,
        reviewedAt: new Date(now - 2 * day),
        reviewComment: 'UI is snappy and aligns with branding guidelines.',
      },
      // Pending timesheet for David Kim (emp1) - ready for manager approval
      {
        user: emp1._id,
        project: proj1._id,
        taskTitle: 'Interactive Timesheet Logging Modal & Weekly Grid View',
        description: 'Crafted the time entry form with auto date selection, project dropdown, and instant validation.',
        date: new Date(now - 1 * day),
        hours: 6.5,
        billable: true,
        status: 'pending',
      },
      {
        user: emp1._id,
        project: proj2._id,
        taskTitle: 'React Native Navigation & Biometric Login integration',
        description: 'Configured deep links, screen transition animations, and keychain secure enclave token caching.',
        date: new Date(now),
        hours: 5,
        billable: true,
        status: 'pending',
      },

      // Priya Patel (emp2)
      {
        user: emp2._id,
        project: proj1._id,
        taskTitle: 'REST API & Aggregation Pipelines for Timesheet Reports',
        description: 'Optimized MongoDB indexing and wrote analytical aggregations for monthly billable revenue.',
        date: new Date(now - 3 * day),
        hours: 8,
        billable: true,
        status: 'approved',
        reviewedBy: manager1._id,
        reviewedAt: new Date(now - 2 * day),
        reviewComment: 'Great query optimization, response time dropped below 30ms.',
      },
      {
        user: emp2._id,
        project: proj3._id,
        taskTitle: 'Docker Swarm & Kubernetes Ingress routing setup',
        description: 'Configured SSL cert-manager with Let\'s Encrypt and cluster load balancing.',
        date: new Date(now - 2 * day),
        hours: 7,
        billable: true,
        status: 'approved',
        reviewedBy: manager2._id,
        reviewedAt: new Date(now - 1 * day),
        reviewComment: 'Cluster passed pen-testing checks.',
      },
      {
        user: emp2._id,
        project: proj1._id,
        taskTitle: 'Webhook triggers for timesheet approval notifications',
        description: 'Wrote event listeners that dispatch real-time in-app alerts on status change.',
        date: new Date(now - 1 * day),
        hours: 6,
        billable: true,
        status: 'pending',
      },

      // Marcus Vance (emp3) - UI/UX Designer
      {
        user: emp3._id,
        project: proj1._id,
        taskTitle: 'Workzen Zen-Clock Logo System & Brand Palette Design',
        description: 'Designed balanced minimalist zen wordmark, SVG clock-enso icon, and Tailwind semantic token definitions.',
        date: new Date(now - 5 * day),
        hours: 8,
        billable: true,
        status: 'approved',
        reviewedBy: manager1._id,
        reviewedAt: new Date(now - 4 * day),
        reviewComment: 'The logo perfectly captures calm efficiency and executive control.',
      },
      {
        user: emp3._id,
        project: proj1._id,
        taskTitle: 'Dashboard Charts & Executive Reporting Layout Design',
        description: 'Figma high-fidelity components for weekly velocity, billable ratios, and project health gauges.',
        date: new Date(now - 2 * day),
        hours: 6.5,
        billable: true,
        status: 'pending',
      },
      {
        user: emp3._id,
        project: proj1._id,
        taskTitle: 'Drafting unapproved mockups without spec alignment',
        description: 'Experimental 3D isometric dashboard widgets.',
        date: new Date(now - 6 * day),
        hours: 4,
        billable: false,
        status: 'rejected',
        reviewedBy: manager1._id,
        reviewedAt: new Date(now - 5 * day),
        reviewComment: 'Please stick to the approved 2D minimalist design system. Please revise and resubmit.',
      },

      // Elena Rostova (emp4) - QA & DevOps
      {
        user: emp4._id,
        project: proj3._id,
        taskTitle: 'Automated E2E Playwright test suite for Auth & Time Logging',
        description: 'Created 24 automated browser test scenarios covering admin, manager, and employee authorization.',
        date: new Date(now - 2 * day),
        hours: 8,
        billable: true,
        status: 'approved',
        reviewedBy: manager2._id,
        reviewedAt: new Date(now - 1 * day),
        reviewComment: 'Zero flaky tests, runs in under 45 seconds in CI.',
      },
      {
        user: emp4._id,
        project: proj2._id,
        taskTitle: 'Load testing & rate limit validation on timesheet endpoints',
        description: 'Simulated 500 concurrent timesheet submissions using k6 scripts.',
        date: new Date(now - 1 * day),
        hours: 6,
        billable: true,
        status: 'pending',
      },
    ];

    await Timesheet.insertMany(timesheetsData);
    console.log('[Seeder] Timesheets seeded successfully.');

    // 4. Create Notifications
    console.log('[Seeder] Creating sample notifications...');
    await Notification.create([
      {
        recipient: manager1._id,
        sender: emp1._id,
        title: 'New Timesheet Awaiting Approval',
        message: 'David Kim submitted 6.5h for "Interactive Timesheet Logging Modal"',
        type: 'submission',
        link: '/approvals',
      },
      {
        recipient: manager1._id,
        sender: emp2._id,
        title: 'New Timesheet Awaiting Approval',
        message: 'Priya Patel submitted 6h for "Webhook triggers for notifications"',
        type: 'submission',
        link: '/approvals',
      },
      {
        recipient: emp1._id,
        sender: manager1._id,
        title: 'Timesheet Approved',
        message: 'Your entry for "Created Project Management UI" (7.5h) was approved by Sarah Jenkins.',
        type: 'approval',
        link: '/timesheets',
      },
      {
        recipient: emp3._id,
        sender: manager1._id,
        title: 'Timesheet Revision Requested',
        message: 'Your entry for "Drafting unapproved mockups" was rejected: Please revise and resubmit.',
        type: 'rejection',
        link: '/timesheets',
      },
    ]);

    console.log('=====================================================');
    console.log(' Workzen Database Seeded Successfully!');
    console.log(' Default Logins:');
    console.log('   Admin:    admin@workzen.io    / Admin@123');
    console.log('   Manager:  manager@workzen.io  / Manager@123');
    console.log('   Employee: employee@workzen.io / Employee@123');
    console.log('=====================================================');

    if (process.argv[1]?.includes('seedData.js')) {
      process.exit(0);
    }
  } catch (error) {
    console.error('[Seeder Error]:', error);
    if (process.argv[1]?.includes('seedData.js')) {
      process.exit(1);
    }
  }
};

// If run directly
if (process.argv[1]?.includes('seedData.js')) {
  seedDatabase();
}
