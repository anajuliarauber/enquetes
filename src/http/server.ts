import fastify from 'fastify'
import { createPoll } from './routes/create-poll'

const app = fastify()

app.listen({ port: 3333 }).then(() => {
  console.log('server running on port :3333')
})

app.register(createPoll)

// https
// get polls/:id
// post polls/:id/votes

//websocket
//results
