const multer = require('multer')
const path = require('path');
const S3 = require('aws-sdk/clients/s3')
var multerS3 = require('multer-s3')
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;
const s3 = new S3({
    region,
    accessKeyId,
    secretAccessKey
})

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, "./public/uploads")
//     },

//     filename: (req, file, cb) => {
//         cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
//     }
// });

// var upload = multer({ storage: storage });

var upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: bucketName,
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            cb(null, Date.now().toString())
        }
    })
})

function getUrlImage(key) {
    const downloadParams = {
        Key: key,
        Bucket: bucketName,
        Expires: 86400
    }
    // return s3.getObject(downloadParams).createReadStream();
    const url = s3.getSignedUrl('getObject', downloadParams)
    return url;
}

module.exports = {
    upload,
    getUrlImage
}