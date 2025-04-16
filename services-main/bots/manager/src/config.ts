import dotenv from 'dotenv'
dotenv.config()

const { CLIENT, GUILD, TOKEN, DATABASE_URL, STAFF_ROLE } = process.env

if (!CLIENT || !GUILD || !TOKEN || !DATABASE_URL || !STAFF_ROLE) {
  throw new Error('Missing environment variables')
}

const config: Record<string, string> = {
  CLIENT,
  GUILD,
  TOKEN,
  DATABASE_URL,
  STAFF_ROLE
}

export default config
