const process = require("node:process");
const UserInput = require("./lib/user-input");
const { ScalewayClient, RESOURCE } = require("./lib/scaleway-client");
const { GetSecrets } = require("./get-secrets");
const { AppConfig } = require("./lib/config");
const {
  childProcess,
  childProcessStdin,
  registryEndpoint,
} = require("./lib/utils");

async function main() {
  const input = new UserInput(`Build application docker image`)
    .arg("environment", "Environment (ci, staging, production)")
    .arg("application", "Application (api, apiv2, app, admin)")
    .arg("tag", "Image tag (commit sha)")
    .optBool("push", "Push image on registry", {
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

  const namespace = await scaleway.findOrThrow(RESOURCE.ContainerNamespace, {
    project_id: project.id,
    name: config.containerNamespace(),
  });

  const imageEndpoint = registryEndpoint(
    namespace.registry_endpoint,
    config.imageName(),
    input.tag
  );

  const image = await scaleway.find(RESOURCE.Image, {
    namespace_id: namespace.registry_namespace_id,
    name: config.imageName(),
  });
  if (image) {
    const imageTag = await scaleway.find(RESOURCE.Image.Tag, {
      image_id: image.id,
      name: input.tag,
    });

    if (imageTag) {
      console.log(`Image ${imageEndpoint} already exists`);
      return;
    }
  }

  console.log(`Building image ${imageEndpoint}`);

  const values = {
    ...secrets,
    ...config.buildEnvVariables(namespace.registry_endpoint, input.tag),
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

  if (input.push) {
    await childProcessStdin(
      "docker",
      [
        "login",
        namespace.registry_endpoint,
        "-u",
        "nologin",
        "--password-stdin",
      ],
      input.SCW_SECRET_KEY,
      { env }
    );
    await childProcess("docker", ["push", imageEndpoint], { env });
  }
}

if (require.main === module) {
  main();
}
