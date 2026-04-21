require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Workspace = require('../models/Workspace');
const Task = require('../models/Task');

const seed = async () => {
  await connectDB();

  console.log('[seed] clearing collections...');
  await Promise.all([User.deleteMany({}), Workspace.deleteMany({}), Task.deleteMany({})]);

  console.log('[seed] creating users...');
  const hashir = await User.create({
    name: 'Hashir',
    email: 'hashir@taskflow.dev',
    password: 'password123',
    avatarColor: '#6366f1',
  });
  const aisha = await User.create({
    name: 'Aisha Khan',
    email: 'aisha@taskflow.dev',
    password: 'password123',
    avatarColor: '#ec4899',
  });
  const omar = await User.create({
    name: 'Omar Siddiqui',
    email: 'omar@taskflow.dev',
    password: 'password123',
    avatarColor: '#10b981',
  });

  console.log('[seed] creating workspace...');
  const ws = await Workspace.create({
    name: 'Product Launch Q2',
    description: 'Coordinating the Q2 product launch across engineering and design.',
    color: '#6366f1',
    owner: hashir._id,
    members: [
      { user: aisha._id, role: 'admin' },
      { user: omar._id, role: 'member' },
    ],
  });

  console.log('[seed] creating tasks...');
  const tasksData = [
    { title: 'Design landing page hero', status: 'in_progress', priority: 'high', assignedTo: aisha._id, order: 0 },
    { title: 'Set up CI/CD pipeline', status: 'done', priority: 'high', assignedTo: hashir._id, order: 0 },
    { title: 'Write API documentation', status: 'todo', priority: 'medium', assignedTo: omar._id, order: 0 },
    { title: 'Configure MongoDB indexes', status: 'todo', priority: 'medium', assignedTo: hashir._id, order: 1 },
    { title: 'Implement rate limiting', status: 'in_progress', priority: 'medium', assignedTo: hashir._id, order: 1 },
    { title: 'User testing session', status: 'todo', priority: 'low', assignedTo: aisha._id, order: 2 },
    { title: 'Deploy to staging', status: 'done', priority: 'high', assignedTo: hashir._id, order: 1 },
    { title: 'Socket.io real-time updates', status: 'done', priority: 'high', assignedTo: hashir._id, order: 2 },
  ];

  for (const t of tasksData) {
    await Task.create({
      ...t,
      workspace: ws._id,
      createdBy: hashir._id,
      description: '',
    });
  }

  console.log('\n✅ Seed complete!');
  console.log('   Login with:');
  console.log('     hashir@taskflow.dev / password123  (owner)');
  console.log('     aisha@taskflow.dev  / password123  (admin)');
  console.log('     omar@taskflow.dev   / password123  (member)');
  console.log(`   Workspace invite code: ${ws.inviteCode}\n`);

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('[seed] error:', err);
  process.exit(1);
});
