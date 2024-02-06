import fastify from 'fastify'

const app = fastify()

app.listen({ port: 3333 }).then(() => {
  console.log('server running on port :3333')
})

app.get("/hello", () => {
  return 'Hello'
})


// https
// post polls
// get polls/:id
// post polls/:id/votes

//websocket
//results
