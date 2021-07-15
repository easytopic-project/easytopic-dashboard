/**
 * @typedef {import('amqplib').Channel} Channel
 */
import amqp from 'amqplib';
import { OCR_INPUT_QUEUE, OCR_OUTPUT_QUEUE, QUEUE_SERVER } from '../env';

export const queues = {
    ocr: [OCR_INPUT_QUEUE, OCR_OUTPUT_QUEUE],
};

let connection = null;
let channel = null;

const listeners = [];

export async function generateConnection() {
    if (connection !== null) return;
    connection = channel = false;
    try {
        connection = await amqp.connect(`amqp://${QUEUE_SERVER}`);
        channel = await connection.createChannel();
        await Promise.all(Object
            .values(queues)
            .flat()
            .map(
                (query) => channel.assertQueue(query, { durable: true }),
            ));
        listeners.forEach((cb) => cb(channel));
        console.log('connected to amqp server.');
    } catch (err) {
        connection = channel = null;
        console.warn(`connection to amqp://${QUEUE_SERVER} failed. retrying in 3 seconds...`);
        setTimeout(generateConnection, 3000);
    }
}

/**
 * Get the connection channel
 * @returns {Promise<Channel>} the
 */
export const getChannel = () => new Promise(resolve => {
    if (channel) return resolve(channel);
    listeners.push(resolve);
    generateConnection();
});

export const getQueue = config => (
    typeof config === 'string' ? config
        : (config.env && process.env[config.env]) || config.default
);
