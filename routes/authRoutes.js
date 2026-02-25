const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// Registrera ny användare
router.post("/register", async (req, res) => {

    try {

        const existingUser = await User.findOne({
            username: req.body.username
        });

        if (existingUser) {
            return res.status(400).json({
                message: "Användarnamnet är upptaget"
            });
        }

        // hasha lösenord
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        // Skapa användare
        const newUser = new User({
            username: req.body.username,
            password: hashedPassword
        });

        const savedUser = await newUser.save();

        res.status(201).json({
            message: "Användaren är skapad",
            user: {
                id: savedUser._id,
                username: savedUser.username
            }
        });

    } catch (err) {

        res.status(400).json({
            message: "Skapandet av användare misslyckades",
            error: err.message
        });
    }

});


// Logga in
router.post("/login", async (req, res) => {

    try {
        const user = await User.findOne({
            username: req.body.username
        });

        //Kontrollerar om användare finns
        if (!user) {
            return res.status(400).json("Användare hittades inte");
        }

        const validPass = await bcrypt.compare(
            req.body.password,
            user.password
        );

        if (!validPass) {
            return res.status(400).json("Felaktigt lösenord");
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.status(200).json({
            message: "Inloggning lyckad!",
            token: token,
            user: {
                id: user._id,
                username: user.username
            }
        });
    } catch (err) {
        res.status(500).json({
            message: "Login failed",
            error: err.message
        });
    }

});

// kontrollera inloggad användare via token
router.get("/validate", async (req, res) => {

    const authHeader = req.header("Authorization");

    if (!authHeader) {
        return res.status(401).json({ message: "Inget token hittades" });
    }

    const token = authHeader.replace("Bearer ", "");

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(verified.id).select("-password");

        res.status(200).json({
            user: user
        });

    } catch (err) {
        res.status(401).json({ message: "Ogiltig token" });
    }
});

module.exports = router;