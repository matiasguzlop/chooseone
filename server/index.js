require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const expressSession = require("express-session");
const cors = require("cors");

const accountsRouter = require("./routers/accounts");
const wishesRouter = require("./routers/wishes");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSession({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.use("/accounts", accountsRouter);
app.use("/wishes", wishesRouter);

const connection_url = process.env.NODE_ENV === "test" ? process.env.DB_CON_URL_TEST : process.env.DB_CON_URL;
mongoose.connect(connection_url)
    .then(() => console.log("DB connection established"))
    .catch((error) => console.log(error));

const PORT = process.env.PORT;
process.env.NODE_ENV !== "test" &&
    app.listen(PORT, () => {
        console.log(`Server running at ${PORT}`);
    });

module.exports = {
    app
};