// const S3 = require('aws-sdk/clients/s3')
// const fs = require('fs');
// if (process.env.NODE_ENV !== 'production') {
//     require('dotenv').config()
// }

// const bucketName = process.env.AWS_BUCKET_NAME;
// const region = process.env.AWS_BUCKET_REGION;
// const accessKeyId = process.env.AWS_ACCESS_KEY;
// const secretAccessKey = process.env.AWS_SECRET_KEY;
// const s3 = new S3({
//     region,
//     accessKeyId,
//     secretAccessKey
// })

// function uploadFile(file) {
//     const fileStream = fs.createReadStream(file.path);
//     const uploadParams = {
//         Bucket: bucketName,
//         Body: fileStream,
//         Key: file.filename
//     }
//     return s3.upload(uploadParams).promise();
// }
// function getUrlImage(key) {
//     const downloadParams = {
//         Key: key,
//         Bucket: bucketName,
//         Expires: 86400
//     }
//     // return s3.getObject(downloadParams).createReadStream();
//     const url = s3.getSignedUrl('getObject', downloadParams)
//     return url;
// }
// module.exports = {
//     uploadFile,
//     getUrlImage
// }
