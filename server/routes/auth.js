const express = require("express");
const {register, login} = require("../controllers/authController");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.get("/protected", auth, (req, res) => {
    return res.status(200).json({
        message: "You are authenticated",
        user: req.user
    });
});

module.exports = router;