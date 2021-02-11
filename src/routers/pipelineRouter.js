import { Router } from 'express';
import LocalDatabase from '../lib/LocalDatabase';
import { getChannel, queues } from '../lib/queueConnection';

const pipelineRouter = new Router();
/**
 * @type {import('amqplib').Channel}
 */
let channel = null;

async function listenOutputs() {
    if (channel !== null) return;
    channel = await getChannel();
    Object.values(queues).forEach(([_, outQueue]) => channel.consume(outQueue, msg => {
        const response = JSON.parse(msg.content.toString());
        LocalDatabase.updateItem(response.id, { status: 'done', response });
        channel.ack(msg);
    }));
}

pipelineRouter.post('/ocr', async ({ body: { file } }, res) => {
    if (!file) return res.send(400);
    const ch = await getChannel();
    let item = LocalDatabase.postItem({ type: 'ocr', status: 'waiting' });
    const data = { file, id: item.id };
    ch.sendToQueue(queues.ocr[0], Buffer.from(JSON.stringify(data)));
    item = LocalDatabase.updateItem(item.id, { data });
    listenOutputs();
    res.send(item);
});

pipelineRouter.get('/:id', ({ params: { id } }, res) => res
    .send(LocalDatabase.getItem(id) || 404));

pipelineRouter.get('/', (req, res) => res.send(Object.values(LocalDatabase.data)));

export default pipelineRouter;
