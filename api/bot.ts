import type { VercelRequest, VercelResponse } from '@vercel/node'
import { handler } from '../apps/bot/src/index'

export default async function botHandler(req: VercelRequest, res: VercelResponse) {
  await handler(req as Request, res as unknown as Response)
}
