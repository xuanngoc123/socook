if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}
const express = require('express')
const app = express()
const passport = require('./src/config/passport')
const bodyParser = require('body-parser')
const cors = require('cors')
const connectDB = require('./src/config/connectDB')
const path = require('path');
const { upload } = require('./src/config/multer')
const fs = require('fs');
// const http = require('http')
// let server = http.createServer(app)
// app.use(express.static('/public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(upload.array());
// app.use(express.static(path.join(__dirname, "public")));

app.use(cors({
    origin: [process.env.BASE_URL_FRONTEND, process.env.BASE_URL_FRONTEND1],
    methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

app.use(express.json())

app.use(passport.initialize());

connectDB();

const authRouter = require('./src/routes/auth')
const userRouter = require('./src/routes/user')
const recipeRouter = require('./src/routes/recipe')
const interacRouter = require('./src/routes/interac')



const host = process.env.PORT || 8080;

app.use('/api/auth', authRouter)
app.use('/api/user', userRouter)
app.use('/api/recipe', recipeRouter)
app.use('/api/interac', interacRouter)

app.post('/arrimg', upload.any(), (req, res) => {
    console.log(req.files);
})

app.get('/', (req, res) => {
    res.send("check host");
})

app.listen(host, () => {
    console.log(`App listen on port ${host}`);
});