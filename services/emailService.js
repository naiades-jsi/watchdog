const sendmail = require('sendmail')();
const dotenv = require('dotenv');
dotenv.config();

class EmailService {
    constructort(){}

    sendEmail(subject, textContent){
        sendmail({
            from: process.env.SENDER_EMAIL,
            to: process.env.RECEIVER_EMAIL,
            replyTo: process.env.SENDER_EMAIL,
            subject: subject,
            text: textContent
        }, (err, reply) => {
            console.log(err && err.stack);
            console.log(reply);
        });
    }
}

module.exports = EmailService;