const handleAPIError = (res, error) => {
    let reason = "Unkwown error";
    let status = 500;
    switch (error.code) {
        case 0:
            reason = "This account doesn't exists.";
            status = 404;
            break;
        case 1:
            reason = "Account not specified.";
            status = 400;
            break;
        case 2:
            reason = "Validation not passed, check validationReasons for details.";
            status = 400;
            break;
        case 3:
            reason = "Wrong password.";
            status = 401;
            break;
        case 4:
            reason = "Not licensed.";
            status = 401;
            break;
        case 5:
            reason = "Attributes not enough.";
            status = 401;
            break;
        case 6:
            reason = "Not logged in";
            status = 401;
            break;
        case 7:
            reason = "Email not verified";
            status = 401;
            break;
        case 8:
            reason= "Data not passed";
            status = 400;
            break;
        case 11000:
            // reason = `[MongoDB]: Duplicate key error ${error.keyValue}`;
            reason = "Validation not passed, check validationReasons for details.";
            error.validationReasons = { field: Object.keys(error?.keyValue), reason: "Duplicated" };
            status = 409;
            break;
    }
    let response = {
        reason: reason,
        code: error.code
    };
    if ("validationReasons" in error) {
        response = {
            ...response,
            validationReasons: error.validationReasons
        };
    }
    if (status === 500) {
        response = {
            ...response,
            originalError: error
        };
    }
    res.status(status).json(response);
};


module.exports = {
    handleAPIError,
};