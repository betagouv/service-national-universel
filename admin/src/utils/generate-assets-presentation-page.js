const path = require("path");
const fs = require("fs/promises");
const slugify = require("slugify");

const projectDir = path.resolve(__dirname, "..", "..");
const srcDir = path.join(projectDir, "src");
const destinationPath = path.join(srcDir, "scenes", "develop", "AssetsPresentationPage.js");
let uniqueId = 0;

(async function () {
  console.log("-------------------------------------------------------");
  console.log("🤖 Generating Assets presentation page...");

  const relativeAssetsDirFromScene = "../../assets";
  const context = await exploreDir(srcDir, "assets", relativeAssetsDirFromScene);
  const view = createView(context);

  await fs.writeFile(destinationPath, view);

  console.log("✅ Assets presentation page generated.");
  console.log("-------------------------------------------------------");
})();

function getNextUniqueId() {
  return ++uniqueId;
}

async function exploreDir(basedir, dir, relativeDir) {
  const uniqueId = getNextUniqueId();
  let context = {
    title: dir,
    folders: [],
    components: [],
  };

  const currentDir = path.join(basedir, dir);
  const files = await fs.readdir(currentDir);
  for (const file of files) {
    const stat = await fs.lstat(path.join(currentDir, file));
    if (stat.isDirectory()) {
      const folder = await exploreDir(currentDir, file, path.join(relativeDir, file));
      context.folders.push(folder);
    } else {
      if (file.endsWith(".png") || file.endsWith(".svg") || file.endsWith(".jpg") || file.endsWith(".gif")) {
        context.components.push(addImage(file, relativeDir));
      } else if (file.endsWith(".js")) {
        context.components.push(addComponent(file, relativeDir, uniqueId));
      }
    }
  }

  return context;
}

function addImage(file, dir) {
  let componentName = slugify(file, { strict: true, trim: true, lower: true, replacement: "_" }) + "_" + uniqueId;
  componentName = componentName.substring(0, 1).toUpperCase() + componentName.substring(1);
  return {
    type: "image",
    name: file,
    require: { [componentName]: path.join(dir, file) },
    item: `<img src={${componentName}} alt="${file}" crossOrigin="anonymous" className="${imageClass}"/>`,
  };
}

function addComponent(file, dir, uniqueId) {
  const dotIndex = file.lastIndexOf(".");
  let componentName = slugify(file.substring(0, dotIndex), { strict: true, trim: true, lower: true, replacement: "_" }) + "_" + uniqueId;
  componentName = componentName.substring(0, 1).toUpperCase() + componentName.substring(1);
  return {
    type: "component",
    name: file,
    require: { [componentName]: path.join(dir, file) },
    item: `<${componentName} />`,
  };
}

const pageClass = "p-8";
const titleClass = "text-3xl font-bold text-[#000000] my-8";
const itemsListClass = "grid grid-cols-6 gap-4";
const itemClass = "border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center";
const imageClass = "";
const itemNameClass = "absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]";
const foldersListClass = "";
const folderClass = "";

function createView(context) {
  let imports = [];
  const folderView = createFolderView(context, imports);

  return `/* eslint-disable prettier/prettier */\nimport React from "react";\n${imports.join(
    "\n",
  )}\n\nexport default function AssetsPresentationPage() {\n\treturn (\n<div className="${pageClass}">${folderView}</div>\n\t);\n}\n`;
}

function createFolderView(context, imports) {
  // --- prepare elements
  const components = [];
  const title = `<div className="${titleClass}">${context.title}</div>`;
  for (const item of context.components) {
    if (item.require) {
      for (const compName of Object.keys(item.require)) {
        imports.push(`import ${compName} from "${item.require[compName]}";`);
      }
    }
    components.push(`<div className="${itemClass}">${item.item}<div className="${itemNameClass}">${item.name}</div></div>`);
  }
  const folders = context.folders.map((folder) => createFolderView(folder, imports));

  // build view
  return `<div className="${folderClass}">${title}<div className="${itemsListClass}">${components.join("")}</div><div className="${foldersListClass}">${folders.join(
    "",
  )}</div></div>`;
}
