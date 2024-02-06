import fastify from 'fastify'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const app = fastify()
const prisma = new PrismaClient()

app.listen({ port: 3333 }).then(() => {
  console.log('server running on port :3333')
})

app.post("/polls", async (request, reply) => {
  const { body } = request

  const createPollBody = z.object({
    title: z.string()
  })

  const { title } = createPollBody.parse(body)

  const poll = await prisma.poll.create({
    data: {
      title
    }
  })
  return reply.status(201).send({ pollId: poll.id })
})

// https
// get polls/:id
// post polls/:id/votes

//websocket
//results
