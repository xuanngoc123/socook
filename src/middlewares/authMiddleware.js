const jwt = require('jsonwebtoken')
const authMiddleware = {
    veryfiToken: (req, res, next) => {
        const token = req.headers.token;
        if (token) {
            const accessToken = token.split(" ")[1];
            jwt.verify(accessToken, process.env.ACCESS_TOKEN_KEY, (err, data) => {
                if (err) {
                    res.status(403).json("token ko hop le");
                }
                req.user = data;
                next();
            })
        } else {
            res.status(401).json("ban chua duoc xac thuc");
        }
    },
    veryfiAdminToken: (req, res, next) => {
        authMiddleware.veryfiToken(req, res, () => {
            if ((req.user.user_id == req.params.id) || (req.user.role == 'admin')) {
                next();
            } else {
                res.status(403).json("ko có quyền truy cap");
            }
        })
    },
    checkToken: (req, res, next) => {
        const token = req.headers.token;
        if (token) {
            const accessToken = token.split(" ")[1];
            jwt.verify(accessToken, process.env.ACCESS_TOKEN_KEY, (err, data) => {
                if (err) {
                    res.send("bạn đã đăng nhập nhưng phiên làm vc đã hết hạn");
                }
                req.user = data;

                res.send("bạn đã đăng nhập").json(data);
            })
        } else {
            res.send("bạn chưa đăng nhập");
        }
    },
}
module.exports = authMiddleware;