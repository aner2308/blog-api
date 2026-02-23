const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.post("/login", async (req, res) => {

    const user = await User.findOne({
        username: req.body.username
    });

    if (!user) {
        return res.status(400).json("User not found");
    }

    const validPass = await bcrypt.compare(
        req.body.password,
        user.password
    );

    if(!validPass) {
        return res.status(400).json("Felaktigt lösenord");
    }

    const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET
    );

    res.json({ token });

});

module.exports = router;