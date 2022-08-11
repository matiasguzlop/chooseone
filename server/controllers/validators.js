const validator = require("validator");
const Account = require("../models/Account");

const validateLogin = (loginData) => {//TODO
    const output = {
        result: true,
        reasons: []
    };
    return output;
};

const validateNewUser = (newUser) => {
    const output = {
        result: true,
        reasons: []
    };
    Object.keys(Account.schema.obj).forEach((field) => {
        // field === "email" && console.log(`Checking ${field}`)
        // field === "email" && console.log(`${field in newUser} `)
        if (Account.schema.obj[field].required && !(field in newUser)) {
            output.result = false;
            output.reasons.push({ field: field, reason: "Not provided" });
        }
    });
    if (!output.result)
        return output;
    if (!validator.isEmail(newUser.email)) {
        output.result = false;
        output.reasons.push({ field: "email", reason: "Not valid" });
    }
    if (validator.isEmpty(newUser.name)) {
        output.result = false;
        output.reasons.push({ field: "name", reason: "Empty field" });
    }
    return output;
};



module.exports = {
    validateNewUser,
    validateLogin,
};