import bcrypt from 'bcryptjs'
import nodemailer from 'nodemailer'
import dev from '../config'

//Hash the password
export const genPassword = async (plainPassword: string) => {
  const saltRounds = 10
  try {
    return await bcrypt.hash(plainPassword, saltRounds)
  } catch (error) {
    console.log(error)
  }
}

//Verify password
export const compPassword = async (
  plainPassword: string,
  hashPassword: string
) => {
  return await bcrypt.compare(plainPassword, hashPassword)
}

//Send Activation Email

interface EmailData {
  email: string
  subject: string
  html: string
}
export const sendEmailWithNodeMailer = async (emailData: EmailData) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: dev.app.smtpUsername, // generated ethereal user
        pass: dev.app.smtpPassword, // generated ethereal password
      },
    })

    const mailOptions = {
      from: dev.app.smtpUsername, // sender address
      to: emailData.email, // list of receivers
      subject: emailData.subject, // Subject line
      html: emailData.html, // html body
    }

    // send mail with defined transport object
    await transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error)
      } else {
        console.log('Message sent: %s', info.response)
      }
    })
  } catch (error) {
    console.log('Problem sending Email: ', error)
  }
}
