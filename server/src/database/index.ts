import knex from 'knex';
import dotenv from 'dotenv';

dotenv.config();

const config = {
  development: {
    client: 'postgresql',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'invoisity_dev',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: './src/database/migrations',
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: './src/database/seeds'
    }
  },
  production: {
    client: 'postgresql',
    connection: process.env.DATABASE_URL,
    pool: {
      min: 2,
      max: 20
    },
    migrations: {
      directory: './dist/database/migrations',
      tableName: 'knex_migrations'
    },
    acquireConnectionTimeout: 60000,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  }
};

const environment = process.env.NODE_ENV || 'development';
const dbConfig = config[environment as keyof typeof config];

export const db = knex(dbConfig);

export const initializeDatabase = async () => {
  try {
    // Test the connection
    await db.raw('SELECT 1');
    console.log('✅ Database connection established');
    
    // Run migrations
    await db.migrate.latest();
    console.log('✅ Database migrations completed');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    console.log('🔧 Continuing without database for UI/UX development...');
    
    // Don't exit in development mode - allow UI/UX work to continue
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

export default config;