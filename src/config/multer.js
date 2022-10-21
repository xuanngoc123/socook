const multer = require('multer');
const path = require('path');
const S3 = require('aws-sdk/clients/s3');
var multerS3 = require('multer-s3');
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;
const s3 = new S3({
  region,
  accessKeyId,
  secretAccessKey,
});
var upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: bucketName,
    metadata: function (req, file, cb) {
      cb(null, {fieldName: file.fieldname});
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString());
    },
  }),
  fileFilter: function (req, file, cb) {
    if (
      file.mimetype == 'image/png' ||
      file.mimetype == 'image/jpg' ||
      file.mimetype == 'image/jpeg' ||
      file.mimetype == 'image/svg'
    ) {
      cb(null, true);
    } else {
      req.fileValidationError = 'Only .png, .jpg, .jpeg and .svg format allowed';
      return cb(null, false, req.fileValidationError);
    }
  },
  limits: 1 * 1024 * 1024,
});

function getUrlImage(key) {
  if (key == null || key == '') return null;
  const downloadParams = {
    Key: key,
    Bucket: bucketName,
    Expires: 86400,
  };
  // return s3.getObject(downloadParams).createReadStream();
  const url = s3.getSignedUrl('getObject', downloadParams);
  return url;
}

module.exports = {
  upload,
  getUrlImage,
};
