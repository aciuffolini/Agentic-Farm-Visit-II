import { FastifyInstance } from 'fastify';
import { LLMRouter } from '../lib/llm/router';
import { ChatRequestSchema } from '@farm-visit/shared';

const router = new LLMRouter();

export default async function (fastify: FastifyInstance) {
  fastify.post('/api/chat', async (request, reply) => {
    try {
      const body = ChatRequestSchema.parse(request.body);
      const { messages, meta } = body;

      reply.type('text/event-stream');
      reply.header('Cache-Control', 'no-cache');
      reply.header('Connection', 'keep-alive');

      const { stream, provider, model } = await router.stream(
        messages,
        meta,
        {
          strategy: (request.query as any)?.strategy,
          model: (request.query as any)?.model,
        }
      );

      for await (const token of stream) {
        reply.raw.write(
          `data: ${JSON.stringify({ token, provider, model })}\n\n`
        );
      }

      reply.raw.write('data: [DONE]\n\n');
      reply.raw.end();
    } catch (error: any) {
      reply.code(400).send({ error: error.message });
    }
  });
}
