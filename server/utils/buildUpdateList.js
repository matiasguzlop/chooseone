const read = require("fs-readdir-recursive");
const fs = require("fs/promises");

const buildUpdateList = async path => {
    const list = read(path);
    const arrayPath = path.split("/");
    arrayPath.splice(1, 0, "lists");
    const listPath = arrayPath.join("/") + ".txt";
    try {
        await fs.access("data/lists");
    } catch (error) {
        await fs.mkdir("data/lists");
    }
    list.splice(0, 0, path);
    await fs.writeFile(listPath, list.join("\n"));
    return listPath;
};

module.exports = buildUpdateList;