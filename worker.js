const { connectRabbitMQ } = require('./rabbitmqConnection');
const { connectRedis } = require('./redisConnection');
const { taskSettings, rabbitMQ } = require('./config');
const logger = require('./util/logger');

async function processTask(task) {
    const delay = task.complexity === 'high' ? taskSettings.highComplexityDelay : taskSettings.lowComplexityDelay;
    await new Promise(resolve => setTimeout(resolve, delay));
    return `Processed task ${task.id}`;
}

async function publishResult(channel, resultsQueue, task, result) {
    const resultMessage = JSON.stringify({ taskId: task.id, result });
    await channel.sendToQueue(resultsQueue, Buffer.from(resultMessage), {
        persistent: true
    });
    logger.info(`Published result for task ${task.id} to results queue`);
}

async function startWorker() {
    try {
        const channel = await connectRabbitMQ();
        const redisClient = await connectRedis();

        const queue = rabbitMQ.taskQueue;
        const resultsQueue = rabbitMQ.resultsQueue;

        await channel.assertQueue(queue, { durable: true });
        await channel.assertQueue(resultsQueue, { durable: true });
        channel.prefetch(1);

        logger.info(`Worker started, waiting for messages in ${queue}`);

        channel.consume(queue, async msg => {
            const task = JSON.parse(msg.content.toString());
            const cacheKey = `task_result_${task.id}`;

            try {
                let result;
                const cachedResult = await redisClient.get(cacheKey);

                if (cachedResult) {
                    logger.info(`Retrieved cached result for task ${task.id}`);
                    result = cachedResult;
                } else {
                    result = await processTask(task);
                    await redisClient.setEx(cacheKey, taskSettings.cacheExpiration, result);
                    logger.info(`Processed task ${task.id}`);
                }

                await publishResult(channel, resultsQueue, task, result);
            } catch (err) {
                logger.error(`Error processing task ${task.id}. ${err.message}`);
            } finally {
                channel.ack(msg);
            }
        }, { noAck: false });

    } catch (error) {
        logger.error(`Error in worker  ${error.message}`);
    }
}

startWorker();
