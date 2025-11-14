import { FastifyInstance } from 'fastify';

export default async function (fastify: FastifyInstance) {
  fastify.get('/ping', async (request, reply) => {
    return { pong: 'it works!' };
  });
}
