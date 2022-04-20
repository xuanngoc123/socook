const { google } = require("googleapis");
const nodemailer = require("nodemailer");

const CLIENT_ID = process.env.CLIENT_ID;

const CLIENT_SECRET = process.env.CLIENT_SECRET

const REDIRECT_URL = 'https://developers.google.com/oauthplayground'
const REFRESH_TOKEN = '1//04vjE82d3ZqqVCgYIARAAGAQSNwF-L9IrdKQBi3S2GNNaE9IBrY_VGyD6o7bGSC-dM2UAKr_xEbCb6DaddSMtvE1ye6eJYAFayQY'

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

async function sendMail(email, content) {
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
            from: '"Cook Social"<admin>', // sender address
            to: email, // list of receivers
            subject: "Active Account", // Subject line
            // text: "Click link to verify account: ", // plain text body
            html: content // html body
        })
        return result

    } catch (error) {
        return error
    }
}

module.exports = sendMail