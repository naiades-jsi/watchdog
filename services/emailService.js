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
                user: "",
                pass: ""
            }
        });

        const email = {
            from: 'no-reply@watchdog.com',
            to: '',
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