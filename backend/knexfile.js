import 'dotenv/config';

export default {
  development: {
    client: 'pg',
    connection: process.env.DATABASE_URL || {
      host: process.env.DB_HOST || 'db',
      port: Number(process.env.DB_PORT || 5432),
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'holding_finance'
    },
    pool: { min: 2, max: 10 },
    migrations: { directory: './db/migrations', tableName: 'knex_migrations' },
    seeds: { directory: './db/seeds' }
  }
};
