const jwt = require('jsonwebtoken');
const authMiddleware = {
  veryfiToken: (req, res, next) => {
    const token = req.headers.token;
    if (!token) {
      res.status(401).json('you are not authenticate!');
    }
    if (token) {
      const accessToken = token.split(' ')[1];
      jwt.verify(accessToken, process.env.ACCESS_TOKEN_KEY, (err, data) => {
        if (err) {
          res.status(403).json('token invalid!');
        } else {
          req.user = data;
          next();
        }
      });
    }
  },
  veryfiTokenActive: (req, res, next) => {
    const token = req.headers.token;
    if (!token) {
      res.status(401).json('you are not authenticate!');
    }
    if (token) {
      const accessToken = token.split(' ')[1];
      jwt.verify(accessToken, process.env.ACCESS_TOKEN_KEY, (err, data) => {
        if (err) {
          res.status(403).json('token invalid!');
        } else {
          if (data.status == 0) {
            res.status(403).json('you are not active');
          }
          req.user = data;
          next();
        }
      });
    }
  },
  veryfiTokenForAdmin: (req, res, next) => {
    authMiddleware.veryfiToken(req, res, () => {
      if (req.user.role == 'admin') {
        next();
      } else {
        res.status(403).json('you are not allowed');
      }
    });
  },
  checkToken: (req, res, next) => {
    const token = req.headers.token;
    if (token) {
      const accessToken = token.split(' ')[1];
      jwt.verify(accessToken, process.env.ACCESS_TOKEN_KEY, (err, data) => {
        if (err) {
          req.result = {
            messageCode: 2,
            message: 'token invalid!',
          };
          next();
        }
        req.result = {
          messageCode: 1,
          message: 'token valid!',
          user: data,
        };
        next();
      });
    } else {
      req.result = {
        messageCode: 0,
        message: 'you are not authenticate!',
      };
      next();
    }
  },
};
module.exports = authMiddleware;
