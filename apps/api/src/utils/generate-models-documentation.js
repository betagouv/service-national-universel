var fs = require("fs");
const files = fs.readdirSync("./src/models");

function buildDoc(model, str, parent = "", debug = false) {
  for (let i = 0; i < Object.keys(model.schema.paths).length; i++) {
    const key = Object.keys(model.schema.paths)[i];
    const isRequired = model.schema.paths[key].options.required ? "`required`" : "`optional`";
    let defaultValue = model.schema.paths[key].options.default;
    defaultValue = defaultValue ? `<br/>Default: ${defaultValue}` : "";
    const documentation = model.schema.paths[key].options.documentation || {};
    if (documentation.generated || key === "_id" || key === "__v") continue;

    const type = model.schema.paths[key].instance;
    const description = (documentation.description || "") + (documentation.deprecated ? " `deprecated`" : "");

    const title = parent ? `${parent}.${key}` : key;
    debug && console.log(`${title};${isRequired};${description}`);
    str += `|${addSpaces(`${title} ${isRequired}`)} |${type} ${defaultValue}|${description}|\n`;

    if (model.schema.paths[key]["schema"]) {
      str = buildDoc(model.schema.paths[key], str, key);
    }
  }
  return str;
}

function addSpaces(text) {
  if (text.length > 7) return `${text}  ${"&nbsp;".repeat(17)}`;
}

let str = "";

console.log(`🔧  building documentation for ${files.length} models`);
for (let i = 0; i < files.length; i++) {
  const model = require(`../models/${files[i]}`);
  str += `
    ${model.modelName.toUpperCase()}\n
  `;
  str += `| Name | Type | Description |\n`;
  str += `| ------ | --- | --- |\n`;
  str = buildDoc(model, str);
  console.log(`👉  ${model.modelName}`);
}

fs.writeFileSync("./docs/MDD.md", str);
console.log("🔥  done");
process.exit(0);
