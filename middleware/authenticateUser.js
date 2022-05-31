const jwt = require("jsonwebtoken");

module.exports.verifyToken = (req, res, next) => {
    try {
        if(!req.headers.authorization) {
            return res.status(403).send({message: "Token required"});
        }
        const token = req.headers.authorization.replace("Bearer ","");
        try {
            const decodedToken = jwt.verify(token, process.env.SECRET);
        } catch(error) {
            console.log(error);
            return res.status(401).send({message: "Authentication failed"});
        }
        return next();
    } catch(error) {
        console.log(error);
        return res.status(500).send({message: "Internal server error. Please try again later"});
    }

}