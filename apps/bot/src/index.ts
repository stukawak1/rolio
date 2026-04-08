import { Bot, webhookCallback } from 'grammy'

const token = process.env.BOT_TOKEN
if (!token) throw new Error('BOT_TOKEN is not set')

const miniAppUrl = process.env.MINI_APP_URL ?? 'https://rolio.vercel.app'

export const bot = new Bot(token)

bot.command('start', async (ctx) => {
  await ctx.reply(
    '👋 Привет! Я Rolio — учу IT-профессии через настоящие жизненные истории.\n\n' +
    'Выбери роль и начни своё первое приключение 👇',
    {
      reply_markup: {
        inline_keyboard: [[
          {
            text: '🎭 Открыть Rolio',
            web_app: { url: miniAppUrl },
          },
        ]],
      },
    }
  )
})

// Webhook handler for Vercel serverless
export const handler = webhookCallback(bot, 'std/http')
