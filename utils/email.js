const nodemailer = require('nodemailer');
const CatchAsync = require('./catchAsync');

const sendEmail = CatchAsync(async (options) => {
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERID,
            pass: process.env.EMAIL_PASSWORD
        }
    });
    const mailOptions = {
        from: `test email <test@example.com>`,
        to: options.email,
        subject: options.subject,
        text: options.message,

    };
    await transport.sendMail(mailOptions)
});

module.exports = sendEmail;