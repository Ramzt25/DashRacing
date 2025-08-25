export const ENV = {
  PORT: Number(process.env.PORT ?? 4000),
  DATABASE_URL: process.env.DATABASE_URL ?? 'postgresql://user:password@localhost:5432/dash',
  JWT_SECRET: process.env.JWT_SECRET ?? 'dev-secret',
  ORIGIN: process.env.ORIGIN ?? '*',
};
