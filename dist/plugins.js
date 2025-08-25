import Fastify from 'fastify';
import sensible from '@fastify/sensible';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { ENV } from './env.js';
export function buildServer() {
    const app = Fastify({ logger: true });
    app.register(sensible);
    app.register(cors, { origin: ENV.ORIGIN, credentials: true });
    app.register(jwt, { secret: ENV.JWT_SECRET });
    return app;
}
//# sourceMappingURL=plugins.js.map