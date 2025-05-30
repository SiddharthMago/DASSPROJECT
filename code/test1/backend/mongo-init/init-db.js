// MongoDB initialization script
// This runs when the MongoDB container starts for the first time

db = db.getSiblingDB('project_test');

// Create a user for the application
db.createUser({
  user: 'app_user',
  pwd: 'app_password123',
  roles: [
    {
      role: 'readWrite',
      db: 'project_test'
    }
  ]
});

// Create any initial collections or indexes if needed
// db.createCollection('announcements');
// db.createCollection('users');
// db.createCollection('faqs');

print('Database initialization completed!');
