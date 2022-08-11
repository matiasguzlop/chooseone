const bcrypt = require("bcrypt");

const hashPassword = (password) => {
    return new Promise((resolve, reject) => {
        bcrypt.genSalt(10, (saltError, salt) => {
            if (saltError) {
                reject(saltError);
            } else {
                bcrypt.hash(password, salt, (hashError, hash) => {
                    if (hashError) {
                        reject(hashError);
                    }
                    resolve(hash);
                });
            }
        });
    });
};

const verifyPassword = (password, hash) => {
    return new Promise((resolve, reject) => {
        bcrypt.compare(password, hash, function (error, isMatch) {
            if (error) {
                reject(error);
            }
            if (isMatch) {
                resolve(true);
            } else {
                resolve(false);
            }
        });
    });
};

module.exports = {
    hashPassword,
    verifyPassword
};