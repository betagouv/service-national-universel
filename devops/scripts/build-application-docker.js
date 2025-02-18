const process = require("node:process");
const UserInput = require("./lib/user-input");
const { ScalewayClient, RESOURCE } = require("./lib/scaleway-client");
const { GetSecrets } = require("./get-secrets");
const { AppConfig, getRegistryName } = require("./lib/config");
const {
  childProcess,
  childProcessStdin,
  registryEndpoint,
} = require("./lib/utils");

async function main() {
  const input = new UserInput(`Build application docker image`)
    .arg("environment", "Environment (ci, staging, production, development)")
    .arg("application", "Application (api, apiv2, app, admin)")
    .arg("tag", "Image tag (commit sha)")
    .optBool("push", "Push image on registry", {
      default: false,
    })
    .optBool("login", "Login on registry", {
      default: false,
    })
    .env("SCW_SECRET_KEY", "Scaleway secret key")
    .env("SCW_ORGANIZATION_ID", "Scaleway organization identifier")
    .validate();

  const scaleway = new ScalewayClient(
    input.SCW_SECRET_KEY,
    input.SCW_ORGANIZATION_ID
  );
  const config = new AppConfig(input.environment, input.application);

  const project = await scaleway.findProject(config.projectName());
  const secrets = await new GetSecrets(scaleway, {
    project: project,
    secretName: config.buildSecretName(),
  }).execute();

  const registry = config.dockerRegistry();

  const registryNamespace = await scaleway.findOrThrow(RESOURCE.RegistryNamespace, {
    project_id: project.id,
    name: getRegistryName(registry),
  });

  const imageEndpoint = registryEndpoint(
    registry,
    config.imageName(),
    input.tag
  );

  const image = await scaleway.find(RESOURCE.Image, {
    namespace_id: registryNamespace.id,
    name: config.imageName(),
  });
  if (image) {
    const imageTag = await scaleway.find(RESOURCE.Image.Tag, {
      image_id: image.id,
    });

    if (imageTag) {
      console.log(`Image ${imageEndpoint} already exists`);
      return;
    }
  }

  const containerNamespace = await scaleway.find(RESOURCE.ContainerNamespace, {
    project_id: project.id,
    name: config.containerNamespace(),
  });

  const containerNamespaceRegistry = containerNamespace ? containerNamespace.registry_endpoint : input.environment;

  console.log(`Building image ${imageEndpoint}`);

  const values = {
    ...secrets,
    ...config.buildEnvVariables(containerNamespaceRegistry, input.tag),
  };

  const args = [
    "build",
    "--label",
    `created_at=${new Date().toISOString()}`,
    "-t",
    imageEndpoint,
    "-f",
    `${input.application}/Dockerfile`,
    ".",
  ];
  const env = {
    ...process.env,
  };
  for (const key in values) {
    const value = values[key];
    if (config.mountSecretKeys().includes(key)) {
      args.push("--secret");
      args.push(`id=${key}`);
      env[key] = value;
    } else {
      args.push("--build-arg");
      args.push(`${key}=${value}`);
    }
  }

  await childProcess("docker", args, { env });

  if (input.login) {
    await childProcessStdin(
      "docker",
      ["login", registry, "-u", "nologin", "--password-stdin"],
      input.SCW_SECRET_KEY,
      { env }
    );
  }
  if (input.push) {
    await childProcess("docker", ["push", imageEndpoint], { env });
  }
}

if (require.main === module) {
  main();
}
