const express = require("express");
const router = express.Router();
const {
    createWish,
    getAllWishes,
    updateWish,
    deleteWish
} = require("../controllers/wishes.js");

router.post("/", createWish);
router.get("/all", getAllWishes);
router.post("/updateWish", updateWish);
router.delete("/", deleteWish);

module.exports = router;