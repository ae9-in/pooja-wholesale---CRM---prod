process.env.NODE_ENV = "test";
process.env.DATABASE_URL ??= "postgresql://postgres:postgres@localhost:5432/wholesale_crm?schema=public";
process.env.CORS_ORIGIN ??= "http://localhost:5173";
process.env.UPLOAD_DIR ??= "uploads";
