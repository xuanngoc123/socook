const multer = require('multer')
const path = require('path');

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, "./public/uploads")
//     },

//     filename: (req, file, cb) => {
//         cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
//     }
// });

if (process.env.NODE_ENV === 'production') {
    var storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, "./build")
        },
        filename: function (req, file, cb) {
            cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
        }
    })
} else {
    var storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, path.resolve(__dirname, './public/uploads'))
        },
        filename: function (req, file, cb) {
            cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
        }
    })
}
var upload = multer({ storage: storage });

module.exports = upload