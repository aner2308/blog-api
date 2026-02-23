const jwt = require("jsonwebtoken");

module.exports = function(req, res, next) {
    
    const token = req.header("Authorization");
    
    if(!token) {
        return res.status(401).json("Behörighet saknas")
    }

    try {

        const verified = jwt.verify(
            token.replace("Bearer ", ""),
            process.env.JWT_SECRET
        );

        req.user = verified;
        next();

    } catch {
        res.status(400).json("Felaktigt token");
    }
};