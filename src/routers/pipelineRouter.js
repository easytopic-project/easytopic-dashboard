import { Router } from 'express';
import LocalDatabase from '../lib/LocalDatabase';
import { getChannel, getQueue } from '../lib/queueConnection';
import pipelines from '../pipelines';
// import Step from '../lib/Step';
// import Pipeline from '../lib/Pipeline';

const pipelineOptions = pipelines.reduce((options, p) => ({ ...options, [p.id]: p }), {});

const pipelineRouter = new Router();

/**
 * Start an job step processing
 * @param {Object} job the pipeline job object
 * @param {(Step | Number)} [step] the current step oject or index. default to first step
 */
async function startProccessing({
    type, input, data: jobData, id,
}, step) {
    const pipeline = pipelineOptions[type];
    if (!step) step = 0;
    if (typeof step === 'number') step = pipeline.jobs[step];
    const queue = getQueue(step.queues[0]);
    const data = Object.entries(step.arguments).reduce(
        (data, [field, value]) => {
            if (value.indexOf(':') !== -1) {
                const [job, arg] = value.split(':');
                return { ...data, [field]: jobData[job][arg] };
            }
            return { ...data, [field]: input[value] };
        },
        { id, job: step.id },
    );

    const ch = await getChannel();

    ch.sendToQueue(queue, Buffer.from(JSON.stringify(data)));
}

/**
 * Listen to an job output queue
 * @param {string|Object} queue to start listening
 */
async function listenQueue(queue) {
    const ch = await getChannel();
    ch.consume(getQueue(queue), msg => {
        const { id, job: jobId, ...response } = JSON.parse(msg.content.toString());
        /** @type {Object} the current item */
        const item = LocalDatabase.getItem(id);
        const pipeline = pipelines.find(p => p.id === item.type);
        const jobIndex = pipeline.jobs.findIndex(j => j.id === jobId);
        /** @type {Object} the current job */
        const job = pipeline.jobs[jobIndex];

        const output = Object
            .entries(job.output)
            .reduce((out, [field, value]) => ({ ...out, [field]: response[value] }), {});
        item.data[jobId] = output;
        if (jobIndex === pipeline.jobs.length - 1) item.status = 'done';
        LocalDatabase.updateItem(id, item);

        if (pipeline.jobs[jobIndex + 1]) startProccessing(item, jobIndex + 1);
        ch.ack(msg);
    });
}

pipelines.forEach(pipeline => pipeline.jobs.forEach(async job => listenQueue(job.queues[1])));

pipelineRouter.post('/:id', async ({ body: input, params }, res) => {
    const pipeline = pipelineOptions[params.id];
    if (!pipeline) return res.status(404).send('pipeline not found');

    const missing = pipeline.input.find(field => field.required && !input[field.id]);
    if (missing) return res.status(400).send(`field ${missing.id} is required`);

    const job = LocalDatabase.postItem({
        type: pipeline.id, input, output: null, version: pipeline.version, status: 'waiting', data: {},
    });

    await startProccessing(job);

    res.send(job);
});

pipelineRouter.get('/options', (req, res) => res.send(
    pipelines.map(({ pipeline, ...info }) => info),
));

pipelineRouter.get('/:id', ({ params: { id } }, res) => res
    .send(LocalDatabase.getItem(id) || 404));

pipelineRouter.get('/', (req, res) => res.send(Object.values(LocalDatabase.data)));

export default pipelineRouter;
