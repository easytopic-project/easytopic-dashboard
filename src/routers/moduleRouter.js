import { Router } from "express";
import axios, { Axios } from "axios";
import { RMQ_API } from "../env";
import { exec } from "child_process";
import { getChannel } from "../lib/queueConnection";
import Docker from "dockerode";
import { all } from "express/lib/application";
import { FILES_SERVER } from "../env";
import MongoDatabase from "../lib/MongoDatabase";

async function getDefaultModules() {
  const modules = await MongoDatabase.getModules({default: true});
  return modules.map((module) => module.id);
}

const moduleRouter = new Router();

async function listenModuleConnection() {
  const ch = await getChannel();
  ch.assertQueue("events", { durable: true });
  try {
    ch.bindQueue("events", "amq.rabbitmq.event", "connection.created");
  } catch (error) {
    console.log(error);
  }
  ch.consume("events", (msg) => {
    //const {props} = JSON.parse(msg.properties.toString());
    //console.log(`New Connection`);
    //console.log(msg);
    ch.ack(msg);
  });
}

async function getAvaiableModules() {
  const authParams = {
    username: "guest",
    password: "guest",
  };

  const res = await axios.get(`http://${RMQ_API}/api/connections`, {
    auth: authParams,
  });

  const modules = res.data.map(({ client_properties, connected_at, user }) => ({
    //information: client_properties.information,
    platform: client_properties.platform,
    //product: client_properties.product,
    version: client_properties.versions,
    user: user,
    connected_at: connected_at,
    ...client_properties.module_specs,
  }));

  return modules;
}

async function getAvaiableModulesContainers() {
  const containers = await getContainers();
}

async function getContainers() {
  let data = await new Promise((resolve, reject) => {
    docker.listContainers({ all: true }, (err, containers) => {
      err ? reject(err) : resolve(containers);
    });
  });
  return data;
}

async function getImages() {
  let data = await new Promise((resolve, reject) => {
    docker.listImages({ all: true }, (err, images) => {
      err ? reject(err) : resolve(images);
    });
  });
  return data;
}

moduleRouter.get("/", async (req, res) => {
  //const data = await getAvaiableModules();
  const containers = await getContainers();
  const modules = await MongoDatabase.getModules();
  const modulesInfo = modules.map(async (module) => {
    const app = containers.find(
      (container) =>
        container.Names.includes("/" + module.id + "-container") ||
        container.Names.includes(
          "/" + "easytopic-dashboard-api_" + module.id + "_1"
        )
    );
    if (app) return { ...module, containerInfo: { ...app } };
  });

  const dataInPromise = await Promise.all(modulesInfo);

  res.send(dataInPromise.filter((elem) => elem)); // filters nulls
});

moduleRouter.get("/containers", async (req, res) => {
  const data = await getContainers();

  res.send(data);
});

moduleRouter.get("/images", async (req, res) => {
  const data = await getImages();

  res.send(data);
});

moduleRouter.post("/stop", async ({ body: { id } }, res) => {
  const defaultModules = await getDefaultModules();
  const container = defaultModules.includes(id)
    ? docker.getContainer("easytopic-dashboard-api_" + id + "_1")
    : docker.getContainer(id + "-container");
  container.stop();
  res.send("container" + id + "stopped");
});

moduleRouter.post("/start", async ({ body: { id } }, res) => {
  const defaultModules = await getDefaultModules();
  const container = defaultModules.includes(id)
    ? docker.getContainer("easytopic-dashboard-api_" + id + "_1")
    : docker.getContainer(id + "-container");
  container.start();
  res.send("container" + id + "started");
});

moduleRouter.post("/add", async ({ body: { build, configFile } }, res) => {
  if (!build || !configFile) {
    res.sendStatus(401);
    return;
  }
  const fileRes = await axios.get(
    `http://${FILES_SERVER}/files/${configFile.name}`
  );
  const config = fileRes.data;

  await MongoDatabase.addModule(config);

  console.log(`Build from client: ${build}`);

  const containers = await getContainers();
  const images = await getImages();

  const builtImage = images.find((image) =>
    image.RepoTags.find((name) => name.includes(config.id + "-image"))
  );

  const builtContainer = containers.find((container) =>
    container.Names.includes("/" + config.id + "-container")
  );

  if (builtContainer) {
    console.log("container already built");
    const container = docker.getContainer(builtContainer.Id);
    container.start(function (err, data) {
      container.attach(
        {
          stream: true,
          stdout: true,
          stderr: true,
          tty: true,
        },
        function (err, stream) {
          if (err) {
            console.log("ERRO2");
            return;
          }

          stream.pipe(process.stdout);

          container.start(function (err, data) {
            if (err) {
              console.log("ERRO3");
              return;
            }
          });
        }
      );
    });
    res.send("container already built, starting it");
    return;
  }

  if (builtImage) {
    console.log("image already built");
    res.send("image already built");
    return;
  }

  console.log(`Built Image: ${JSON.stringify(builtImage, null, "\t")}`);
  console.log(`Built Container: ${JSON.stringify(builtContainer, null, "\t")}`);

  docker.buildImage(
    null,
    { t: config.id + "-image", remote: build },
    function (err, stream) {
      if (err) {
        console.log(err);
        return;
      }

      stream.pipe(process.stdout, {
        end: true,
      });

      stream.on("end", function () {
        docker.createContainer(
          {
            Image: config.id + "-image",
            Cmd: [],
            name: config.id + "-container",
            HostConfig: { NetworkMode: "host" },
          },
          function (err, container) {
            container.start(function (err, data) {
              container.attach(
                {
                  stream: true,
                  stdout: true,
                  stderr: true,
                  tty: true,
                },
                function (err, stream) {
                  if (err) {
                    console.log("ERRO2");
                    return;
                  }

                  stream.pipe(process.stdout);

                  container.start(function (err, data) {
                    if (err) {
                      console.log("ERRO3");
                      return;
                    }
                  });
                }
              );
            });
          }
        );
      });
    }
  );

  res.send("ok");
});

const docker = new Docker({ socketPath: "/var/run/docker.sock" });

listenModuleConnection();

export default moduleRouter;
