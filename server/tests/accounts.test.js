const mongoose = require("mongoose");
const { app } = require("../index.js");
const Account = require("../models/Account.js");
const api = require("supertest-session")(app);
const {
    initialAccount,
    secondAccount,
    updatedAccount,
    createAccountDirectly,
} = require("./helpers");

afterAll(async () => {
    await Account.deleteMany({});
    mongoose.connection.close();
});

beforeEach(async () => {
    await api.post("/accounts/logout");
    await Account.deleteMany({});
    await createAccountDirectly(initialAccount);
});

describe("Session login and logout checks", () => {
    test("Should log in user and return specific data of the account", async () => {
        const { status, body } = await api.post("/accounts/login")
            .send({ email: initialAccount.email, password: initialAccount.password });
        expect(status).toBe(200);
        expect(body.message).toHaveProperty("name", initialAccount.name);
        expect(body.message).toHaveProperty("email", initialAccount.email);
        expect(body.message).toHaveProperty("emailVerified", initialAccount.emailVerified);
        expect(body.message).not.toHaveProperty("password", initialAccount.password);
        const { status: st0 } = await api
            .get("/accounts/isLoggedIn");
        expect(st0).toBe(200);
    });

    test("Should not log in with wrong password, send 401 status and proper message", async () => {
        const { status, body } = await api
            .post("/accounts/login")
            .send({ email: initialAccount.email, password: "this is a wrong password" });
        expect(status).toBe(401);
        expect(body).toHaveProperty("reason", "Wrong password.");
    });

    test("Should not log in with unexistant email, send 404 status and proper message", async () => {
        const { status, body } = await api
            .post("/accounts/login")
            .send({ email: "wrong", password: "AlsoWrong" });
        expect(status).toBe(404);
        expect(body).toHaveProperty("reason", "This account doesn't exists.");
    });

    test("Should start session when login succeeds and should logout", async () => {
        const { status } = await api.post("/accounts/login")
            .send({ email: initialAccount.email, password: initialAccount.password });
        expect(status).toBe(200);
        const { status: s1 } = await api.get("/accounts/isLoggedIn");
        expect(s1).toBe(200);
        const { status: s2 } = await api.post("/accounts/logout");
        expect(s2).toBe(200);
        const { status: s3 } = await api.get("/accounts/isLoggedIn");
        expect(s3).toBe(401);
    });

    test("Should not start session when login fails", async () => {
        const { status: status0 } = await api.post("/accounts/login")
            .send({ email: initialAccount.email, password: "thisisawrongpassword" });
        const { status } = await api.get("/accounts/isLoggedIn");
        expect(status).toBe(401);
    });

    test("When logged user asks for info, API will return 200 and user data (same as any R op)", async () => {
        await api.post("/accounts/login").send({ email: initialAccount.email, password: initialAccount.password });
        const { status, body } = await api.get("/accounts/accountData");
        expect(status).toBe(200);
        expect(body.message).toHaveProperty("_id");
        expect(body.message).toHaveProperty("name", initialAccount.name);
        expect(body.message).toHaveProperty("email", initialAccount.email);
        expect(body.message).toHaveProperty("createdAt");
        expect(body.message).toHaveProperty("updatedAt");
        expect(body.message).toHaveProperty("emailVerified", initialAccount.emailVerified);
        expect(body.message).not.toHaveProperty("password");
    });

    test("When non logged user asks for info, API will return 401.", async () => {
        const { status, body } = await api.get("/accounts/accountData");
        expect(status).toBe(401);
    });

    test("Should create a new account", async () => {
        const { status, body } = await api.post("/accounts").send(secondAccount);
        expect(status).toBe(201);
        expect(body.message).toHaveProperty("_id");
        expect(body.message).toHaveProperty("token");
        expect(body.message).not.toHaveProperty("password");
    });

    test("Read some data when logged in", async () => {
        const { status: s1, body: b1 } = await api.post("/accounts/login").send({ email: initialAccount.email, password: initialAccount.password });
        expect(s1).toBe(200);
        expect(b1.message).toHaveProperty("name", initialAccount.name);
        expect(b1.message).toHaveProperty("emailVerified", true);
        expect(b1.message).not.toHaveProperty("password");
    });

    test("Read full data when logged in and ask for user data", async () => {
        const { status: s1, body: b1 } = await api.post("/accounts/login").send({ email: initialAccount.email, password: initialAccount.password });
        expect(s1).toBe(200);
        expect(b1.message).toHaveProperty("name", initialAccount.name);
        expect(b1.message).toHaveProperty("emailVerified", true);
        expect(b1.message).not.toHaveProperty("password");
        const { status: s2, body: b2 } = await api.get("/accounts/accountData");
        expect(s2).toBe(200);
        expect(b2.message).toHaveProperty("name", initialAccount.name);
        expect(b2.message).toHaveProperty("email", initialAccount.email);
        expect(b2.message).toHaveProperty("token");
        expect(b2.message).toHaveProperty("emailVerified", initialAccount.emailVerified);
        expect(b2.message).toHaveProperty("createdAt");
        expect(b2.message).toHaveProperty("updatedAt");
        expect(b2.message).not.toHaveProperty("password");
    });

    test("Should edit account name", async () => {
        await Account.deleteMany({});
        const { status: status0, body: body0 } = await api.post("/accounts").send(initialAccount);
        const toUpdateId = body0.message._id;
        await api.post("/accounts/login").send({ email: initialAccount.email, password: initialAccount.password });
        const { status, body } = await api
            .post("/accounts/update")
            .send({ id: toUpdateId, data: { name: updatedAccount.name } });
        expect(status).toBe(200);
        expect(body.message).toHaveProperty("modifiedCount", 1);
        const result = await Account.findById(toUpdateId);
        expect(result).toHaveProperty("name", updatedAccount.name);
        expect(result).toHaveProperty("email", initialAccount.email);
    });

    test("Should delete account", async () => {
        await Account.deleteMany({});
        const { status: status0, body: body0 } = await api.post("/accounts/").send(initialAccount);
        const toDeleteId = body0.message._id;
        await api.post("/accounts/login").send({ email: initialAccount.email, password: initialAccount.password });
        const { status, body } = await api
            .delete("/accounts")
            .send({ id: toDeleteId });
        expect(status).toBe(200);
        expect(body.message).toHaveProperty("deletedCount", 1);
        const body2 = await Account.find({});
        expect(body2).toHaveLength(0);
    });

});

describe("Corner cases for Accounts", () => {
    test("Delete unexistant id should return 404 or 400 and proper error message, also don't delete anything", async () => {
        // await createAccount(masterAccount);
        await api.post("/accounts/login").send({ email: initialAccount.email, password: initialAccount.password });
        const { status, body } = await api
            .delete("/accounts")
            .send({ id: "62db1127cbca6a44c76d1558" });
        expect(status).toBe(404);
        expect(body.code).toBe(0);
        expect(body.reason).toBe("This account doesn't exists.");
        const result = await Account.find({});
        expect(result).toHaveLength(1);
    });

    test("Delete not passing id should return 400 and proper error message, also don't delete anything", async () => {
        await api.post("/accounts/login").send({ email: initialAccount.email, password: initialAccount.password });
        const { status, body } = await api
            .delete("/accounts")
            .send({});
        expect(status).toBe(400);
        expect(body.code).toBe(1);
        expect(body.reason).toBe("Account not specified.");
        const result = await Account.find({});
        expect(result).toHaveLength(1);
    });

    test("Edit unexistant id should return 400 and proper error message, also don't edit anything", async () => {
        await api.post("/accounts/login").send({ email: initialAccount.email, password: initialAccount.password });
        const { status, body } = await api
            .post("/accounts/update")
            .send({ id: "62db1127cbca6a44c76d1558", data: updatedAccount });
        expect(status).toBe(404);
        expect(body.code).toBe(0);
        expect(body.reason).toBe("This account doesn't exists.");
        const result = await Account.find({});
        expect(result).toHaveLength(1);
    });

    test("Edit not passing id should return 400 and proper error message, also don't edit anything", async () => {
        await api.post("/accounts/login").send({ email: initialAccount.email, password: initialAccount.password });
        const { status, body } = await api
            .post("/accounts/update")
            .send({ newData: updatedAccount });
        expect(status).toBe(400);
        expect(body.code).toBe(1);
        expect(body.reason).toBe("Account not specified.");
    });

    test("Create account without required values should return 400 and prop error msg", async () => {
        const { status, body } = await api
            .post("/accounts")
            .send({ name: "" });
        expect(status).toBe(400);
        expect(body.code).toBe(2);
        expect(body.reason).toBe("Validation not passed, check validationReasons for details.");
        expect(body).toHaveProperty("validationReasons");
        // console.log(body.validationReasons)
    });

    test("Create account with already taken email should return 409 and prop error msg", async () => {
        const { status, body } = await api.post("/accounts").send(initialAccount);
        expect(status).toBe(409);
        expect(body.code).toBe(11000);
        expect(body.reason).toBe("Validation not passed, check validationReasons for details.");
        expect(body).toHaveProperty("validationReasons");
    });

    test("Should create and activate user", async () => {
        await Account.deleteMany({});
        const { status, body } = await api.post("/accounts").send({ ...initialAccount, emailVerified: false });
        expect(status).toBe(201);
        expect(body.message).toHaveProperty("token");
        const userToken = body.message.token;
        expect(body.message).toHaveProperty("_id");
        const userId = body.message._id;
        //performing email verification:
        const { status: status2 } = await api
            .post("/accounts/verifyEmail")
            .send({ token: userToken });
        expect(status2).toBe(200);
        //checking that account is indeed email verified
        const result = await Account.findById(userId);
        expect(result).toHaveProperty("emailVerified", true);
    });

    test("When updating email, also trigger email verification process", async () => {
        await Account.deleteMany({});
        const { body } = await api.post("/accounts/").send(initialAccount);
        const toUpdateId = body.message._id;
        await api.post("/accounts/login").send({ email: initialAccount.email, password: initialAccount.password });
        //updating email
        const { status: status2, body: body2 } = await api
            .post("/accounts/update")
            .send({ id: toUpdateId, data: { email: "newemail@asd.com" } });
        expect(status2).toBe(200);
        //checking new account to have emailVerified false
        const result = await Account.find({});
        expect(result[0]).toHaveProperty("emailVerified", false);
    });

    test("Edit password should insert new one as hashed string and left emailVerified untouched", async () => {
        await Account.deleteMany({});
        const { body } = await api.post("/accounts").send(initialAccount);
        const accountId = body.message._id;
        await api.post("/accounts/login").send({ email: initialAccount.email, password: initialAccount.password });
        //updating password:
        const newPassword = "4444";
        const { status: status2, body: body2 } = await api
            .post("/accounts/update")
            .send({ id: accountId, data: { password: newPassword } });
        const createdAccount = await Account.findOne({ id: accountId });
        expect(createdAccount.password).not.toBe(newPassword);
        expect(createdAccount).toHaveProperty("emailVerified", initialAccount.emailVerified);
    });

});
