import z from "zod"
import { FastifyInstance } from "fastify"
import { randomUUID } from "node:crypto"
import { prisma } from "../../lib/prisma"
import { redis } from "../../lib/redis"
import { voting } from "../../utils/voting-pub-sub"

export async function voteOnPoll(app: FastifyInstance) {
  app.post("/polls/:pollId/votes", async (request, reply) => {
    const { params, body } = request

    const voteOnPollParams = z.object({
      pollId: z.string().uuid()
    })
    const voteOnPollBody = z.object({
      pollOptionId: z.string().uuid()
    })

    const { pollId } = voteOnPollParams.parse(params)
    const { pollOptionId } = voteOnPollBody.parse(body)

    let { sessionId } = request.cookies

    if (sessionId) {
      const userPreviusVoteOnPole = await prisma.vote.findUnique({
        where: {
          sessionId_pollId: {
            sessionId,
            pollId
          }
        }
      })

      if (userPreviusVoteOnPole && userPreviusVoteOnPole.pollOptionId !== pollOptionId) {
        await prisma.vote.delete({
          where: {
            id: userPreviusVoteOnPole.id
          }
        })

        const votes = await redis.zincrby(pollId, -1, userPreviusVoteOnPole.pollOptionId)

        voting.publish(pollId, {
          pollOptionId: userPreviusVoteOnPole.pollOptionId,
          votes: Number(votes)
        })
      } else if (userPreviusVoteOnPole) {
        return reply.status(400).send({ message: "You already voted in this poll" })
      }
    }

    if (!sessionId) {
      sessionId = randomUUID()

      reply.setCookie("sessionId", sessionId, {
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        signed: true,
        httpOnly: true
      })
    }

    await prisma.vote.create({
      data: {
        sessionId,
        pollId,
        pollOptionId
      }
    })

    const votes = await redis.zincrby(pollId, 1, pollOptionId)

    voting.publish(pollId, {
      pollOptionId,
      votes: Number(votes)
    })

    return reply.status(201).send()
  })
}