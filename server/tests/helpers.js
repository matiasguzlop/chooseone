const { app, server } = require("../index.js");
const Account = require("../models/Account.js");
const api = require("supertest-session")(app);

const initialAccount = {
    name: "Matías Guzmán",
    email: "matiasguzlopx@gmail.com",
    password: "1234",
    emailVerified: true
};

const secondAccount = {
    name: "Felipe López",
    email: "pipex@gmail.com",
    password: "123412398huasd",
    emailVerified: true
};

const updatedAccount = {
    ...initialAccount,
    name: "Felipe López"
};

const wishOne = {
    name:"Oxford cityspeed 2022",
    description: "Just a bicycle",
    linkRef: "https://oxford.com/cityspeed-2022",
}

const wishTwo = {
    name:"Plant",
    description: "A small one for my desktop",
}

const createAccountDirectly = async (account) => {
    // console.log("CREATING NEW ACCOUNT DIRECTLY")
    const newAccount = new Account(account);
    return await newAccount.save();
};

const getAllAccountsDirectly = async () => {
    return result = await Account.find({});
};

module.exports = {
    initialAccount,
    updatedAccount,
    createAccountDirectly,
    getAllAccountsDirectly,
    secondAccount,
    wishTwo,
    wishOne
};