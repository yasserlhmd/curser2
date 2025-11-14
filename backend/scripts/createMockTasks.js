/**
 * Script to create mock tasks for testing
 * Run with: node scripts/createMockTasks.js
 */
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...valueParts] = trimmedLine.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        process.env[key.trim()] = value.replace(/^["']|["']$/g, '');
      }
    }
  });
}

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'taskmanager_dev',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

const statuses = ['pending', 'in-progress', 'completed'];

const taskTemplates = [
  { title: 'Complete project documentation', description: 'Write comprehensive documentation for the project' },
  { title: 'Review code changes', description: 'Review pull requests and provide feedback' },
  { title: 'Update dependencies', description: 'Update npm packages to latest versions' },
  { title: 'Fix bug in authentication', description: 'Resolve issue with token refresh' },
  { title: 'Implement new feature', description: 'Add user profile editing functionality' },
  { title: 'Write unit tests', description: 'Add test coverage for new components' },
  { title: 'Optimize database queries', description: 'Improve query performance' },
  { title: 'Design user interface', description: 'Create mockups for new pages' },
  { title: 'Deploy to production', description: 'Prepare and execute production deployment' },
  { title: 'Monitor system performance', description: 'Check server metrics and logs' },
  { title: 'Backup database', description: 'Create full database backup' },
  { title: 'Update security policies', description: 'Review and update security documentation' },
  { title: 'Refactor legacy code', description: 'Improve code structure and readability' },
  { title: 'Set up CI/CD pipeline', description: 'Configure automated testing and deployment' },
  { title: 'Conduct code review', description: 'Review team members code submissions' },
];

async function createMockTasks() {
  try {
    // Get all users
    const usersResult = await pool.query('SELECT id FROM users ORDER BY id');
    const users = usersResult.rows;
    
    if (users.length === 0) {
      console.log('No users found. Please create users first.');
      return;
    }

    console.log(`Found ${users.length} users. Creating tasks...\n`);

    let taskCount = 0;

    // Create tasks for each user
    for (const user of users) {
      // Create 5-8 tasks per user with different statuses
      const numTasks = Math.floor(Math.random() * 4) + 5; // 5-8 tasks
      
      for (let i = 0; i < numTasks; i++) {
        const template = taskTemplates[Math.floor(Math.random() * taskTemplates.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        
        // Add some variation to titles
        const title = `${template.title} ${i + 1}`;
        const description = template.description;
        
        await pool.query(
          `INSERT INTO tasks (title, description, status, user_id)
           VALUES ($1, $2, $3, $4)`,
          [title, description, status, user.id]
        );
        
        taskCount++;
      }
      
      console.log(`✅ Created ${numTasks} tasks for user ${user.id}`);
    }

    console.log(`\n✅ Successfully created ${taskCount} tasks total!`);
    
    // Show summary
    const summary = await pool.query(`
      SELECT 
        u.id as user_id,
        u.name,
        u.email,
        COUNT(t.id) as task_count,
        COUNT(CASE WHEN t.status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN t.status = 'in-progress' THEN 1 END) as in_progress,
        COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed
      FROM users u
      LEFT JOIN tasks t ON u.id = t.user_id
      GROUP BY u.id, u.name, u.email
      ORDER BY u.id
    `);
    
    console.log('\nTask Summary by User:');
    console.log('====================');
    summary.rows.forEach(row => {
      console.log(`${row.name || row.email} (ID: ${row.user_id}):`);
      console.log(`  Total: ${row.task_count} tasks`);
      console.log(`  Pending: ${row.pending}, In Progress: ${row.in_progress}, Completed: ${row.completed}`);
    });
    
  } catch (error) {
    console.error('Error creating mock tasks:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

createMockTasks();

