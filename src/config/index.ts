import dotenv from 'dotenv'
dotenv.config()

const dev = {
  app: {
    serverPort: process.env.SERVER_PORT,
    jwtSecretKey: process.env.JWT_SECRET_KEY,
    jwtAuthorizationKey: process.env.JWT_AUTHORIZATION_KEY,
    smtpUsername: process.env.SMTP_USER,
    smtpPassword: process.env.SMTP_PASSWORD,
    clientUrl: process.env.CLIENT_URL,
  },
  db: {
    url: process.env.DB_URL,
  },
}

export default dev
