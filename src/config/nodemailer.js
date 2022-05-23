const { google } = require("googleapis");
const nodemailer = require("nodemailer");

const CLIENT_ID = process.env.CLIENT_ID;

const CLIENT_SECRET = process.env.CLIENT_SECRET

const REDIRECT_URL = 'https://developers.google.com/oauthplayground'
const REFRESH_TOKEN = process.env.REFRESH_TOKEN

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

async function sendMail(email, content, subject) {
    try {
        const accessToken = await oAuth2Client.getAccessToken();
        const transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                type: 'OAuth2',
                user: process.env.EMAIL_USER,
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                refreshToken: REFRESH_TOKEN,
                accessToken: accessToken
            }
        });
        let result = await transporter.sendMail({
            from: '"Socook"<admin>', // sender address
            to: email, // list of receivers
            subject: subject, // Subject line
            // text: "Click link to verify account: ", // plain text body
            html: content // html body
        })
        return result

    } catch (error) {
        return error
    }
}

module.exports = sendMail