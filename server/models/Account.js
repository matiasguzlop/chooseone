const { createToken } = require("../utils/apiTokens");
const { hashPassword } = require("../utils/hashing");

const mongoose = require("mongoose");
const accountSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: false
    },
    friends: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "Account",
        // default: []
    },
    wishes: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "Wish",
        // default: []
    },
    emailVerified: {
        type: Boolean,
        // required: true,
        default: false
    },
    token: {
        type: String,
        // required: true,
    },
    createdAt: {
        type: Date,
        // required: true,
        default: new Date()
    },
    updatedAt: {
        type: Date,
        // required: false,
        default: new Date()
    },
});



accountSchema.pre("save", async function (next) {
    const account = this;
    if (account.isNew) {
        const token = await createToken({ email: account.email, createdAt: account.createdAt });
        account.token = token;
        next();
    } else {
        return next();
    }
});


accountSchema.pre("save", async function (next) {
    const account = this;
    if (account.isModified("password") || account.isNew) {
        try {
            const hashedPassword = await hashPassword(account.password);
            account.password = hashedPassword;
            next();
        } catch (error) {
            throw new Error("Hashing password failed");
        }
    } else {
        return next();
    }
});

accountSchema.pre("updateOne", async function (next) {
    const newData = this.getUpdate();
    if ("email" in newData) {
        newData.emailVerified = false;
    }
    if ("password" in newData) {
        try {
            const hashedPassword = await hashPassword(newData.password);
            newData.password = hashedPassword;
        } catch (error) {
            throw new Error("Hashing password failed");
        }
    }
    return next();
});

const Account = mongoose.model("Account", accountSchema);
module.exports = Account;