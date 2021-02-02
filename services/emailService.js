const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

class EmailService {
    constructor(){}

    composeAndSend(subject, text){
        let transporter = nodemailer.createTransport({
            host: "smtp.mailtrap.io",
            port: 2525,
            auth: {
                user: "c7c8668d76b453",
                pass: "9b936b928c22a2"
            }
        });

        const email = {
            from: 'no-reply@watchdog.com',
            to: 'mark.bogataj18@gmail.com',
            subject: subject,
            text: text
        };

        transporter.sendMail(email, (err, info) => {
            if (err) {
              console.log(err)
            } else {
              console.log(info);
            }
        });
    }
}

module.exports = EmailService;