const bcrypt = require('bcryptjs');

const env = require('../config/env');
const { connect, mongoose } = require('./connection');
const { User, Event, OfficeBearer } = require('../models');

const ADMIN_NAME = process.env.SEED_ADMIN_NAME || 'IEEE CS Admin';
const ADMIN_EMAIL = (process.env.SEED_ADMIN_EMAIL || 'admin@ieeecs.ac.in').toLowerCase();
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD;

if (!ADMIN_PASSWORD) {
  console.error('❌ SEED_ADMIN_PASSWORD env var is required to run the seed script.');
  process.exit(1);
}
if (ADMIN_PASSWORD.length < 12) {
  console.error('❌ SEED_ADMIN_PASSWORD must be at least 12 characters.');
  process.exit(1);
}

const events = [
  {
    title: 'Tech Talk: AI & Machine Learning Trends 2026',
    description: 'Join us for an enlightening session on the latest advancements in Artificial Intelligence and Machine Learning. Industry experts will share insights on cutting-edge research, real-world applications, and career opportunities in the field.',
    short_description: 'Explore the latest AI & ML trends with industry experts.',
    event_type: 'seminar',
    status: 'upcoming',
    date: '2026-06-15',
    time: '10:00:00',
    venue: 'Seminar Hall A, Main Building',
    is_online: false,
    max_participants: 200,
    tags: ['AI', 'Machine Learning', 'Tech Talk'],
    is_featured: true,
  },
  {
    title: 'Hackathon 2026: Code for Change',
    description: "A 24-hour hackathon where teams compete to build innovative solutions for real-world problems. This year's theme is \"Sustainable Technology for a Better Tomorrow\".",
    short_description: '24-hour hackathon to build innovative tech solutions.',
    event_type: 'hackathon',
    status: 'upcoming',
    date: '2026-07-10',
    time: '09:00:00',
    end_date: '2026-07-11',
    venue: 'Computer Science Block',
    is_online: false,
    max_participants: 150,
    tags: ['Hackathon', 'Coding', 'Innovation'],
    is_featured: true,
  },
  {
    title: 'Workshop: Web Development with React & Node.js',
    description: 'A hands-on workshop covering modern web development practices using React.js for frontend and Node.js for backend development.',
    short_description: 'Hands-on full-stack web development workshop.',
    event_type: 'workshop',
    status: 'completed',
    date: '2026-04-20',
    time: '11:00:00',
    venue: 'Lab 301',
    is_online: false,
    max_participants: 60,
    current_participants: 58,
    tags: ['Web Dev', 'React', 'Node.js'],
    is_featured: false,
  },
];

const bearers = [
  { name: 'Ayan Ahmad Khan', position: 'Chairperson', department: 'Computer Science', year: '3rd Year', order_index: 1 },
  { name: 'Gagandeep Kushwaah', position: 'Vice Chairperson', department: 'Computer Science', year: '3rd Year', order_index: 2 },
  { name: 'Divita Joshi', position: 'Secretary', department: 'Information Technology', year: '3rd Year', order_index: 3 },
  { name: 'Devanshu Gupta', position: 'Treasurer', department: 'Computer Science', year: '2nd Year', order_index: 4 },
  { name: 'Arjun Singh', position: 'Technical Head', department: 'CSE', year: '3rd Year', order_index: 5 },
  { name: 'Kavya Reddy', position: 'Event Coordinator', department: 'IT', year: '3rd Year', order_index: 6 },
  { name: 'Ayush', position: 'Webmaster', department: 'CSE', year: '2nd Year', order_index: 7 },
  { name: 'Ananya Joshi', position: 'PR & Outreach Head', department: 'CSE', year: '2nd Year', order_index: 8 },
];

const run = async () => {
  await connect();

  const password_hash = await bcrypt.hash(ADMIN_PASSWORD, env.bcryptRounds);
  await User.updateOne(
    { email: ADMIN_EMAIL },
    { $setOnInsert: { name: ADMIN_NAME, email: ADMIN_EMAIL, password_hash, role: 'admin' } },
    { upsert: true }
  );

  for (const e of events) {
    await Event.updateOne(
      { title: e.title },
      { $setOnInsert: e },
      { upsert: true }
    );
  }

  for (const b of bearers) {
    await OfficeBearer.updateOne(
      { name: b.name, tenure_year: '2025-2026' },
      { $setOnInsert: { ...b, tenure_year: '2025-2026' } },
      { upsert: true }
    );
  }

  console.log('✅ Database seeded successfully');
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
