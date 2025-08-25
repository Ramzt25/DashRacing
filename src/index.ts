import { buildServer } from './plugins.js';
import { registerAuthRoutes } from './auth.js';
import { registerCarRoutes } from './routes/cars.js';
import { registerEventRoutes } from './routes/events.js';
import { registerMeetupRoutes } from './routes/meetups.js';
import { registerRaceRoutes } from './routes/races.js';
import { registerLiveMapRoutes } from './routes/livemap.js';
import { registerAIRoutes } from './routes/ai.js';
import { registerWebScrapingRoutes } from './routes/webscraping.js';
import { registerUserStatsRoutes } from './routes/userstats.js';
import { ENV } from './env.js';

const app = buildServer();

await registerAuthRoutes(app);
await registerCarRoutes(app);
await registerEventRoutes(app);
await registerMeetupRoutes(app);
await registerRaceRoutes(app);
await registerLiveMapRoutes(app);
await registerAIRoutes(app);
await registerWebScrapingRoutes(app);
await registerUserStatsRoutes(app);

app.get('/', async () => ({ ok: true, service: 'Dash API' }));
app.get('/health', async () => ({ 
  status: 'healthy', 
  timestamp: new Date().toISOString(),
  service: 'Dash API',
  version: '1.0.0'
}));

app.listen({ port: ENV.PORT, host: '0.0.0.0' })
  .then(address => app.log.info(`Listening on ${address}`))
  .catch(err => { app.log.error(err); process.exit(1); });
