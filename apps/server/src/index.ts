import Fastify from 'fastify';
import { glob } from 'glob';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fastify = Fastify({
  logger: true,
});

const start = async () => {
  try {
    const routeFiles = await glob('routes/**/*.ts', {
      cwd: __dirname,
    });

    for (const file of routeFiles) {
      const route = await import(path.join(__dirname, file));
      fastify.register(route.default);
    }

    await fastify.listen({ port: 3000, host: '0.0.0.0' });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
