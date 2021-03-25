const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

class EmailService {
    constructor(){
        this.transporter = nodemailer.createTransport({
            host: 'mail.ijs.si',
            port: 25
        });
    }

    sendEmail(subject, textContent){
        const msg = {
            from: process.env.SENDER_EMAIL,
            to: process.env.RECEIVER_EMAIL,
            subject: subject,
            text: textContent 
        };

        this.transporter.sendMail(msg, (err, info) => {
            if(err){
                console.log("ERROR! " + err);
            } else {
                console.log("INFO " + info);
            }
        });
    }
}

module.exports = EmailService;