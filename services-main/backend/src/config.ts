import * as dotenv from 'dotenv'
dotenv.config()

const { PORT, DATABASE_URL, JWT_SECRET, VERSION, XOR_KEY, WEBHOOKS } = process.env

if (!PORT || !DATABASE_URL || !JWT_SECRET || !VERSION || !XOR_KEY || !WEBHOOKS) {
  throw new Error('Missing environment variables')
}

const config: Record<string, string> = {
  PORT,
  DATABASE_URL,
  JWT_SECRET,
  VERSION,
  XOR_KEY,
  WEBHOOKS
}

export default config
