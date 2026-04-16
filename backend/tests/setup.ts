process.env.NODE_ENV = "test";
process.env.DATABASE_URL ??= "postgresql://postgres:postgres@localhost:5432/wholesale_crm?schema=public";
process.env.CORS_ORIGIN ??= "http://localhost:5173";
process.env.UPLOAD_DIR ??= "uploads";
process.env.DEFAULT_OPERATOR_EMAIL ??= "admin@wholesale.local";
process.env.CRON_SECRET ??= "test-cron-secret-12345";
