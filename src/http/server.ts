import fastify from 'fastify'
import { createPoll } from './routes/create-poll'
import { getPoll } from './routes/get-poll'

const app = fastify()

app.listen({ port: 3333 }).then(() => {
  console.log('server running on port :3333')
})

app.register(createPoll)
app.register(getPoll)

// https
// post polls/:id/votes

//websocket
//results
