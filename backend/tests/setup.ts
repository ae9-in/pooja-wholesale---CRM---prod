process.env.NODE_ENV = "test";
process.env.DATABASE_URL ??= "postgresql://postgres:postgres@localhost:5432/wholesale_crm?schema=public";
process.env.JWT_ACCESS_SECRET ??= "test-access-secret-12345";
process.env.JWT_REFRESH_SECRET ??= "test-refresh-secret-12345";
process.env.JWT_ACCESS_EXPIRES_IN ??= "1d";
process.env.JWT_REFRESH_EXPIRES_IN ??= "7d";
process.env.CORS_ORIGIN ??= "http://localhost:5173";
process.env.UPLOAD_DIR ??= "uploads";
