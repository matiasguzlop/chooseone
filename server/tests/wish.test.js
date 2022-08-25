const mongoose = require("mongoose");
const { app } = require("../index.js");
const Account = require("../models/Account.js");
const Wish = require("../models/Wish.js");
const api = require("supertest-session")(app);
const {
    initialAccount,
    createAccountDirectly,
    wishOne,
    wishTwo
} = require("./helpers");

afterAll(async () => {
    await Account.deleteMany({});
    mongoose.connection.close();
});

beforeEach(async () => {
    await api.post("/accounts/logout");
    await Account.deleteMany({});
    await createAccountDirectly(initialAccount);
    const { status, body } = await api.post("/accounts/login")
        .send({ email: initialAccount.email, password: initialAccount.password });
    await Wish.deleteMany({});
});

describe.only("CRUD ops on Wish", () => {
    test("Create document on logged user's wish.", async () => {
        const { status, body } = await api.post("/wishes/").send(wishOne);
        expect(status).toBe(201);
        expect(body.message).toHaveProperty("_id");
        const newWishId = body.message._id;
        const result = await Wish.find({});
        expect(result[0]).toHaveProperty("name", wishOne.name);
        const result2 = await Account.find({});
        expect(result2[0].wishes[0].toString()).toBe(newWishId);
    });
    test("Read owned wishes list for logged user", async () => {
        await api.post("/wishes/").send(wishOne);
        const { status, body } = await api.get("/wishes/all");
        expect(status).toBe(200);
        expect(body.message).toHaveLength(1);
        expect(body.message[0]).toHaveProperty("name", wishOne.name);
    });
    test("Update wish by id, owned by logged user.", async () => {
        const { body: b0 } = await api.post("/wishes/").send(wishOne);
        const toUpdateId = b0.message._id;
        const { status, body } = await api.post("/wishes/updateWish").send({ id: toUpdateId, data: { name: "Oxford cityspeed 2023" } });
        expect(status).toBe(200);
        expect(body.message).toHaveProperty("modifiedCount", 1);
        const result = await Wish.find({});
        expect(result[0]).toHaveProperty("name", "Oxford cityspeed 2023");
    });
    test("Delete wish by id, owned by logged user.", async () => {
        const { body: b0 } = await api.post("/wishes/").send(wishOne);
        const toDeleteId = b0.message._id;
        const { status, body } = await api.delete("/wishes/").send({ id: toDeleteId });
        expect(status).toBe(200);
        expect(body.message).toHaveProperty("deletedCount", 1);
        const result = await Wish.find({});
        expect(result).toHaveLength(0);
        const result2 = await Account.find({});
        expect(result2[0].wishes).toHaveLength(0);
    });
});