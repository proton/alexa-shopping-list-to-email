import dotenv from 'dotenv'
import nodemailer from 'nodemailer'

dotenv.config()

const RECIPIENT_EMAIL = process.env.RECIPIENT_EMAIL

const SMTP_USER   = process.env.SMTP_USER
const SMTP_PASS   = process.env.SMTP_PASS
const SMTP_HOST   = process.env.SMTP_HOST || 'smtp.gmail.com'
const SMTP_PORT   = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 465
const SMTP_SECURE = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : true

const mailer = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
})

export async function sendEmail(subject, body) {
  return mailer.sendMail({
    from:    SMTP_USER,
    to:      RECIPIENT_EMAIL,
    subject: subject,
    text:    body,
  })
}