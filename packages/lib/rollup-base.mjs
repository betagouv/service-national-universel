import { createRequire } from "node:module";
import path from "path";
import chokidar from "chokidar";

import typescript from "@rollup/plugin-typescript";
import externals from "rollup-plugin-node-externals";

const isWatch = process.env.ROLLUP_WATCH;

const require = createRequire(import.meta.url);

const resolvePath = (module, path) => require.resolve(`${module}${path}`);

const addWatchFile = (filesPath) => ({
  buildStart() {
    filesPath.forEach((file) => {
      const resolvedPath = path.resolve(file);
      this.addWatchFile(resolvedPath);
    });
  },
});

const buildFolderIsCreated = (folder) => {
  const watcher = chokidar.watch(folder, {
    ignored: /(^|[/\\])\../,
    persistent: true,
  });

  return new Promise((resolve) => {
    watcher.on("add", (path) => {
      if (path.endsWith("tsconfig.tsbuildinfo")) {
        resolve(path);
      }
    });
  }).then((path) => {
    return watcher.close().then(() => path);
  });
};

function filterRelevantDependencies(dependencies) {
  return dependencies
    .filter(([key, value]) => {
      return (key.startsWith("@snu") || key.startsWith("snu-")) && value === "*";
    })
    .map(([key]) => key);
}

const watcher = (packageJson) => {
  const dependencies = filterRelevantDependencies(Object.entries(packageJson.dependencies ?? {}));
  const devDependencies = filterRelevantDependencies(Object.entries(packageJson.devDependencies ?? {}));
  const modules = Array.from(new Set(dependencies.concat(devDependencies)));

  const folders = modules.map((module) => {
    try {
      resolvePath(module, "/dist/tsconfig.tsbuildinfo");
    } catch {
      console.log(`Module's ${packageJson.name} dependency ${module} is not built yet. Waiting for a build...`);
    }

    const filePath = resolvePath(module, "/package.json");
    const baseFolder = filePath.split("/").slice(0, -1).join("/");
    return baseFolder;
  });

  return Promise.all(folders.map((folder) => buildFolderIsCreated(folder))).then((filesPath) => {
    return addWatchFile(filesPath);
  });
};

export default function ({ packageJson, input = "src/index.ts", exports = "auto", external = [], plugins = [] }) {
  return {
    input,
    output: [
      // esm for vite (app/admin)
      {
        dir: "dist",
        format: "esm",
        sourcemap: true,
        entryFileNames: "[name].mjs",
        exports,
        interop: "compat",
      },
      // cjs for api
      {
        dir: "dist",
        format: "cjs",
        entryFileNames: "[name].js",
        sourcemap: true,
        exports,
        interop: "compat",
      },
    ],
    external,
    watch: {
      clearScreen: false,
    },
    plugins: [
      isWatch && watcher(packageJson),
      externals(),
      typescript({
        tsconfig: "./tsconfig.json",
        noEmitOnError: process.env.CI === "true",
      }),
      ...plugins,
    ],
  };
}
