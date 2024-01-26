const { connectRabbitMQ } = require('./rabbitmqConnection');
const { rabbitMQ } = require('./config');
const logger = require('./util/logger');

async function sendTaskToQueue(task, channel, queue) {
    try {
        await channel.sendToQueue(queue, Buffer.from(JSON.stringify(task)), { persistent: true });
        logger.info(`Task sent successfully. ${JSON.stringify(task)}`);
    } catch (error) {
        logger.error(`Failed to send task. ${JSON.stringify(task)}, Error: ${error.message}`);
    }
}

async function startProducer() {
    try {
        const channel = await connectRabbitMQ();
        const queue = rabbitMQ.taskQueue;

        await channel.assertQueue(queue, { durable: true });


        const tasks = [
            { id: 1, complexity: 'low' },
            { id: 2, complexity: 'high' },
            // Add more other tasks 
        ];

        tasks.forEach(task => {
            sendTaskToQueue(task, channel, queue);
        });

    } catch (error) {
        logger.error(`Error in producer. ${error.message}`);
    }
}

startProducer();
