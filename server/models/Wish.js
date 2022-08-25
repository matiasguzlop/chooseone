const mongoose = require("mongoose");
const wishSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    linkRef: {
        type: String
    },
    checked: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: new Date()
    },
    updatedAt: {
        type: Date
    }
});

const Wish = mongoose.model("Wish", wishSchema);
module.exports = Wish;