if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}
const express = require('express')
const app = express()
const passport = require('passport')
const bodyParser = require('body-parser')
const cors = require('cors')
const connectDB = require('./src/config/connectDB')
const path = require('path');
const upload = require('./src/config/multer')



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(upload.array());
// app.use(express.static(path.join(__dirname, "public")));

app.use(cors({ origin: true }));
app.use(express.json())

connectDB();

const authRouter = require('./src/routes/auth')
const userRouter = require('./src/routes/user')
const recipeRouter = require('./src/routes/recipe')


const host = process.env.PORT || 8080;

app.use('/api/auth', authRouter)
app.use('/api/user', userRouter)
app.use('/api/recipe', recipeRouter)

app.post('/upload', upload.single('image'), (req, res) => {
    console.log(req.file);
    console.log(req.body.email)
    res.send("Bấm vào link làm gì ^.^");
})

app.listen(host, () => {
    console.log(`App listen on port ${host}`);
});