const { handleAPIError, checkWishBelongsToLoggedUser } = require("./utils");
const Wish = require("../models/Wish");
const Account = require("../models/Account");

const createWish = async (req, res) => {
    const newWishData = req.body;
    try {
        if (!req.session.userId) throw { code: 6 };
        const newWish = new Wish(newWishData);
        const result = await newWish.save();
        await Account.updateOne({ _id: req.session.userId }, {
            $push: {
                wishes: result._id
            }
        });
        res.status(201).json({ message: result });
    } catch (error) {
        if ("code" in error) handleAPIError(res, error);
        res.status(500).json({ message: error });
    }
};

const getAllWishes = async (req, res) => {
    try {
        if (!req.session.userId) throw { code: 6 };
        const result = await Account.findOne({ _id: req.session.userId })
            .select("wishes")
            .populate("wishes");
        res.status(200).json({ message: result.wishes });
    } catch (error) {
        if ("code" in error) handleAPIError(res, error);
        res.status(500).json({ message: error });
    }
};

const updateWish = async (req, res) => {
    const { id, data } = req.body;
    try {
        if (!req.session.userId) throw { code: 6 };
        if (!await checkWishBelongsToLoggedUser(req, id)) throw { code: 8 };
        const result = await Wish.updateOne({ _id: id }, {
            ...data,
            updatedAt: new Date()
        });
        res.status(200).json({ message: result });
    } catch (error) {
        if ("code" in error) handleAPIError(res, error);
        res.status(500).json({ message: error });
    }
};

const deleteWish = async (req, res) => {
    const { id } = req.body;
    try {
        if (!req.session.userId) throw { code: 6 };
        if (!await checkWishBelongsToLoggedUser(req, id)) throw { code: 8 };
        const result = await Wish.deleteOne({ _id: id });
        const result2 = await Account.updateOne({ _id: req.session.userId }, {
            $pull: {
                wishes: id
            }
        });
        res.status(200).json({ message: result });
    } catch (error) {
        if ("code" in error) handleAPIError(res, error);
        res.status(500).json({ message: error });
    }
};


module.exports = {
    createWish,
    getAllWishes,
    updateWish,
    deleteWish
};