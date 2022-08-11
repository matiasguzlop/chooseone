const express = require("express");
const router = express.Router();
const {
    create,
    remove,
    update,
    verifyEmail,
    recovery,
    login,
    getAccountData,
    isLoggedIn,
    logout
} = require("../controllers/accounts");

router.post("/", create);
router.delete("/", remove);
router.post("/update", update);
router.post("/verifyEmail", verifyEmail);
router.get("/recovery", recovery);
router.post("/login", login);
router.get("/isLoggedIn", isLoggedIn);
router.post("/logout", logout);
router.get("/accountData", getAccountData);

module.exports = router;