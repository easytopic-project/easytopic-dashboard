import { Router } from 'express';
import LocalDatabase from '../lib/LocalDatabase';
import { getChannel, getQueue } from '../lib/queueConnection';
import pipelines from '../pipelines';

const pipelineRouter = new Router();

pipelines.forEach(({
    pipeline, id, version, input,
}) => {
    /**
     * @type {import('amqplib').Channel}
     */
    let channel = null;
    // TODO: Support multiple-step pipelines
    const inputQueue = getQueue(pipeline.queues[0]);
    const outputQueue = getQueue(pipeline.queues[1]);

    async function listenOutput() {
        if (channel !== null) return;
        channel = await getChannel();
        let { output: pipelineOut } = pipeline;

        if (pipelineOut instanceof Array) {
            pipelineOut = pipelineOut.reduce((out, field) => ({ ...out, [field]: field }), {});
        }

        channel.consume(outputQueue, msg => {
            const response = JSON.parse(msg.content.toString());
            const output = Object
                .entries(pipelineOut)
                .reduce(
                    (out, [field, value]) => ({ ...out, [field]: response[value] }),
                    {},
                );

            LocalDatabase.updateItem(response.id, { status: 'done', response, output });
            channel.ack(msg);
        });
    }

    pipelineRouter.post(`/${id}`, async ({ body }, res) => {
        // TODO: Generate validation function
        const missing = input.find(field => !body[field.id]);
        if (missing) return res.status(400).send(`field ${missing.id} is required`);

        const ch = await getChannel();
        let item = LocalDatabase.postItem({ type: id, version, status: 'waiting' });
        const data = Object.entries(pipeline.arguments).reduce(
            (data, [field, value]) => ({ ...data, [field]: body[value] }),
            { id: item.id },
        );

        ch.sendToQueue(inputQueue, Buffer.from(JSON.stringify(data)));
        item = LocalDatabase.updateItem(item.id, { input: data });
        listenOutput();
        res.send(item);
    });
});

pipelineRouter.get('/options', (req, res) => res.send(
    pipelines.map(({ pipeline, ...info }) => info),
));

pipelineRouter.get('/:id', ({ params: { id } }, res) => res
    .send(LocalDatabase.getItem(id) || 404));

pipelineRouter.get('/', (req, res) => res.send(Object.values(LocalDatabase.data)));

export default pipelineRouter;
