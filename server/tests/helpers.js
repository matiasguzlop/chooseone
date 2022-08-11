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
    secondAccount
};