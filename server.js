if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}
const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const bodyParser = require('body-parser')
const cors = require('cors')
const flash = require('express-flash')
const session = require('express-session')
const connectDB = require('./src/config/connectDB')
connectDB();
const authRouter = require('./src/routes/auth')
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors({ origin: true }));
app.use(express.json())

const host = process.env.PORT || 3000;

app.use('/api/auth', authRouter)

app.listen(host, () => {
    console.log(`App listen on port ${host}`);
});