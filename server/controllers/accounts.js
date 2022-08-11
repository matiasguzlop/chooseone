const session = require("express-session");
const Account = require("../models/Account.js");
const { verifyToken } = require("../utils/apiTokens.js");
const { sendEmailActivationEmail, sendRecoveryEmail } = require("../utils/emails.js");
const { verifyPassword } = require("../utils/hashing.js");
const { handleAPIError } = require("./utils");
const { validateNewUser } = require("./validators");


const create = async (req, res) => {
    const data = req.body;
    try {
        const validation = validateNewUser(data);
        if (!validation.result) throw { code: 2, validationReasons: validation.reasons };
        const newAccount = new Account(data);
        const result = await newAccount.save();
        // const sendEmailResult = await sendEmailActivationEmail(result);
        res.status(201).json({
            message: {
                _id: result._id,
                token: result.token
            }
        });
    } catch (error) {
        // console.error(error)
        if ("code" in error) {
            handleAPIError(res, error);
        } else {
            res.status(500).json({ message: error });
        }
    }
};



const update = async (req, res) => {
    const { id, data } = req.body;
    try {
        if (!req.session?.userId) throw { code: 6 };
        if (typeof id === "undefined") throw { code: 1 };
        if (!data) throw { code: 8 };
        const result = await Account.updateOne({ _id: id },
            {
                // $set: {
                ...data,
                updatedAt: new Date()
                // }
            });
        if (result.modifiedCount === 0) throw { code: 0 };
        res.status(200).json({ message: result });
    } catch (error) {
        // console.log(error)
        if ("code" in error) {
            handleAPIError(res, error);
        } else {
            res.status(500).json({ message: JSON.stringify(error) });
        }
    }
};

const verifyEmail = async (req, res) => {
    const { token: toVerifyToken } = req.body;
    try {
        const result = await Account.updateOne({ token: toVerifyToken },
            {
                emailVerified: true,
                updatedAt: new Date(),
            }
        );
        // console.log(result)
        if (result.modifiedCount === 0) throw { code: 0 };
        res.status(200).json({ message: result });
    } catch (error) {
        if ("code" in error) {
            handleAPIError(res, error);
        } else {
            res.status(500).json({ message: JSON.stringify(error) });
        }
    }

};

const recovery = async (req, res) => {
    const candidateEmail = req.body.email;
    try {
        const [resp, _] = await Account.find({ email: candidateEmail });
        if (resp) {
            const emailRes = await sendRecoveryEmail(resp);
            res.status(200).json(emailRes);
        } else {
            throw new Error("Account not found");
        }
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

const isLoggedIn = async (req, res) => {
    try {
        if (req.session.userId) {
            res.status(200).end();
        } else {
            res.status(401).end();
        }
    } catch (error) {
        res.status(500).json({ message: error });
    }
};

const logout = async (req, res) => {
    try {
        req.session.destroy(() => {
            res.status(200).end();
        });
    } catch (error) {
        res.status(500).json({ message: error });
    }
};

const remove = async (req, res) => {
    const { id } = req.body;
    try {
        if (!req.session?.userId) throw { code: 6 };
        if (typeof id === "undefined") throw { code: 1 };
        const result = await Account.deleteOne({ _id: id });
        if (result.deletedCount === 0) throw { code: 0 };
        res.status(200).json({ message: result });
    } catch (error) {
        if ("code" in error) {
            handleAPIError(res, error);
        } else {
            res.status(500).json({ message: error });
        }
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;
    const resp = await Account.findOne({ email: email });
    try {
        if (!resp) throw { code: 0 };
        if (!resp.emailVerified) throw { code: 7 };
        const doesPasswordMatch = await verifyPassword(password, resp.password);
        if (!doesPasswordMatch) throw { code: 3 };
        req.session.userId = resp._id.toString();
        req.session.name = resp.name;
        req.session.email = resp.email;
        req.session.emailVerified = resp.emailVerified;
        res.status(200).json({
            message: {
                id: req.session.userId,
                name: req.session.name,
                email: req.session.email,
                emailVerified: req.session.emailVerified
            }
        });
    } catch (error) {
        if ("code" in error) {
            handleAPIError(res, error);
        } else {
            res.status(500).json({ message: error.message });
        }
    }
};

const getAccountData = async (req, res) => {
    try {
        if (!req.session?.userId) throw { code: 6 };
        const resp = await Account.findById(req.session.userId).select({ password: 0 });
        res.status(200).json({ message: resp });
    } catch (error) {
        if (error.code) {
            handleAPIError(res, error);
        } else {
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = {
    create,
    remove,
    update,
    verifyEmail,
    recovery,
    login,
    getAccountData,
    logout,
    isLoggedIn
};