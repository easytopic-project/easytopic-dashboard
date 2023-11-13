import { Router } from "express";
import { getChannel, getQueue } from "../lib/queueConnection";
import MongoDatabase from "../lib/MongoDatabase";
// import Step from '../lib/Step';
// import Pipeline from '../lib/Pipeline';

const getPipelineOptions = (pipelines) =>
  pipelines.reduce((options, p) => ({ ...options, [p.id]: p }), {});

const pipelineRouter = new Router();

/**
 * Start an job step processing
 * @param {Object} job the pipeline job object
 * @param {(Step | Number)} [step] the current step oject or index. default to first step
 */
async function startProccessing(job, step) {
  const { type, input, data: jobData, id, jobStatus } = job;
  pipelines = await MongoDatabase.getPipelines();
  const pipeline = getPipelineOptions(pipelines)[type];

  if (!step) step = 0;
  if (typeof step === "number") step = pipeline.jobs[step];
  jobStatus[step.id].startAt = new Date();
  await MongoDatabase.updateItem(id, { jobStatus });

  if (step.type === "aggregation")
    return step.jobs.forEach((s) => startProccessing(job, s));

  const queue = getQueue(step.queues[0]);
  const data = Object.entries(step.arguments).reduce(
    (data, [field, value]) => {
      if (value.indexOf(":") !== -1) {
        const [job, arg] = value.split(":");
        return { ...data, [field]: jobData[job][arg] };
      }
      return { ...data, [field]: input[value] };
    },
    { id, job: step.id }
  );

  const ch = await getChannel();

  ch.sendToQueue(queue, Buffer.from(JSON.stringify(data)));
}

/**
 * Listen to an job output queue
 * @param {string|Object} queue to start listening
 */
async function listenQueue(queue) {
  console.log("Listening to:", queue);
  const ch = await getChannel();
  pipelines = await MongoDatabase.getPipelines();
  ch.assertQueue(getQueue(queue), { durable: true });
  ch.consume(getQueue(queue), async (msg) => {
    const { id, job: jobId, ...response } = JSON.parse(msg.content.toString());
    /** @type {Object} the current item */
    const item = await MongoDatabase.getItem(id);
    const pipeline = pipelines.find((p) => p.id === item.type);
    const jobIndex = pipeline.jobs.findIndex((j) => {
      if (j.type === "aggregation") {
        return j.jobs.find((s) => s.id === jobId);
      }
      return j.id === jobId;
    });
    /** @type {Object} the current job */
    let job = pipeline.jobs[jobIndex];
    const aggregation = job.id !== jobId;
    if (aggregation) job = job.jobs.find((j) => j.id === jobId);

    const output = Object.entries(job.output).reduce(
      (out, [field, value]) => ({ ...out, [field]: response[value] }),
      {}
    );
    if (!item.data) item.data = {}
    item.data[jobId] = output;
    item.jobStatus[jobId].finishAt = new Date();
    await MongoDatabase.updateItem(id, item);
    if (
      !aggregation ||
      pipeline.jobs[jobIndex].jobs.every((j) => item.data[j.id])
    ) {
      if (aggregation)
        item.jobStatus[pipeline.jobs[jobIndex].id].finishAt = new Date();
      if (jobIndex === pipeline.jobs.length - 1) {
        item.status = "done";
        item.finishAt = new Date();
      }
      if (pipeline.jobs[jobIndex + 1]) startProccessing(item, jobIndex + 1);
      await MongoDatabase.updateItem(id, item);
    }
    ch.ack(msg);
  });
}

let pipelines = MongoDatabase.getPipelines().then((pipelines) =>{
  pipelines.forEach((pipeline) =>
    pipeline.jobs
      .reduce((jobs, j) => jobs.concat(j.jobs.length ? j.jobs : j), []) // Concat aggregation steps
      .forEach(async (job) => listenQueue(job.queues[1]))
  )}, (err) => console.log(err)
);

/**
 * @openapi
 * /pipeline/new:
 *  post:
 *    tags:
 *      - Pipelines
 *    summary: Creates a new pipeline
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/CreateNewPipeline'
 *    responses:
 *      200:
 *        description: Success in creating pipeline
 *      400:
 *        description: Bad request
 */
pipelineRouter.post("/new", async ({ body: pipeline }, res) => {
  if (!pipeline) return res.status(404).send("no pipeline sent");
  if (!pipeline.id) return res.status(404).send("missing pipeline id");
  if (!pipeline.jobs) return res.status(400).send("missing jobs");

  pipeline.jobs.forEach((j) => {
    if (j.output instanceof Array)
      j.output = j.output.reduce((j, field) => ({ ...j, [field]: field }), {});
    if (j.type && j.type == "aggregation") {
      j.jobs.forEach((s) => {
        if (s.output instanceof Array)
          s.output = s.output.reduce(
            (s, field) => ({ ...s, [field]: field }),
            {}
          );
      });
    }
  });

  pipeline.jobs
    .reduce((jobs, j) => jobs.concat(j.jobs || j), []) // Concat aggregation steps
    .forEach(async (job) => listenQueue(job.queues[1]));

  await MongoDatabase.addPipeline(pipeline);

  res.send(`pipeline of id '${pipeline.id}' created`);
});

/**
 * @openapi
 * '/pipeline/{id}':
 *  post:
 *    tags:
 *      - Jobs
 *    summary: Starts processing a job
 *    parameters:
 *      - name: id
 *        in: path
 *        description: Id of an existing pipeline
 *        required: true
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/CreateNewPipeline'
 *    responses:
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/CreateNewPipeline'
 *      404:
 *        description: Pipeline with given id not found
 */
pipelineRouter.post("/:id", async ({ body: input, params }, res) => {
  pipelines = await MongoDatabase.getPipelines();
  const pipeline = getPipelineOptions(pipelines)[params.id];
  if (!pipeline) return res.status(404).send("pipeline not found");

  const missing = pipeline.input.find(
    (field) => field.required && !input[field.id]
  );
  if (missing) return res.status(400).send(`field ${missing.id} is required`);

  const job = await MongoDatabase.postItem({
    type: pipeline.id,
    input,
    output: null,
    version: pipeline.version,
    status: "waiting",
    data: {},
    createdAt: new Date(),
    finishAt: null,
    jobStatus: pipeline.jobs
      .reduce((jobs, j) => jobs.concat(j.jobs ? [...j.jobs, j] : j), [])
      .reduce(
        (status, j) => ({
          ...status,
          [j.id]: { startAt: null, finishAt: null },
        }),
        {}
      ),
  });
  await startProccessing(job);

  res.send(job);
});

/**
 * @openapi
 * /pipeline/options:
 *  get:
 *    tags:
 *      - Pipelines
 *    summary: Get avaiable pipelines options
 *    responses:
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/CreateNewPipeline'
 *      400:
 *        description: Bad request
 */
pipelineRouter.get("/options", async (req, res) => {
  pipelines = await MongoDatabase.getPipelines();
  res.send(pipelines.map(({ pipeline, ...info }) => info));
});

/**
 * @openapi
 * '/pipeline/{id}':
 *  get:
 *    tags:
 *      - Jobs
 *    summary: Get status of the specific executed job
 *    parameters:
 *      - name: id
 *        in: path
 *        description: Id of an iniciated job
 *        required: true
 *    responses:
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/CreateNewPipeline'
 *      400:
 *        description: Bad request
 */
pipelineRouter.get("/:id", async ({ params: { id } }, res) => {
  res.send(await MongoDatabase.getItem(id) || 404)}
);

/**
 * @openapi
 * '/pipeline':
 *  get:
 *    tags:
 *      - Jobs
 *    summary: Get status of all the executed jobs
 *    responses:
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/CreateNewPipeline'
 *      400:
 *        description: Bad request
 */
pipelineRouter.get("/", async (req, res) =>
  res.send(Object.values(await MongoDatabase.getAllItems()))
);

export default pipelineRouter;
