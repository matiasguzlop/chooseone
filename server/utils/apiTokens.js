const jsonwebtoken = require("jsonwebtoken");

const secret = process.env.SECRET;

const createToken = async (data) => {
    return new Promise((resolve, reject) => {
        jsonwebtoken.sign(data, secret, (err, token) => {
            if (err) {
                reject(err);
            } else {
                resolve(token);
            }
        });
    });
};

const verifyToken = async (data, token) => {
    return new Promise((resolve, reject) => {
        jsonwebtoken.verify(token, secret, (err, obtainedData) => {
            if (err) {
                reject(err);
            } else {
                if (obtainedData?.email === data.email && obtainedData?.createdAt === data.createdAt.toISOString()) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            }
        });
    });
};

module.exports = {
    createToken,
    verifyToken
};