const { connectRabbitMQ } = require('./rabbitmqConnection');
const { rabbitMQ } = require('./config');
const logger = require('./util/logger');

async function startSupervisor() {
    try {
        const channel = await connectRabbitMQ();
        const resultsQueue = rabbitMQ.resultsQueue;

        await channel.assertQueue(resultsQueue, { durable: true });

        logger.info("Supervisor is waiting for results.....");

        channel.consume(resultsQueue, msg => {
            try {
                const result = JSON.parse(msg.content.toString());
                logger.info(`Received result for task ID ${result.taskId}: ${result.result}`);

                // Here, you can add further processing or storage logic for the results

                // Acknowledge the message
                channel.ack(msg);
            } catch (err) {
                logger.error(`Error processing message from results queue. ${err.message}`);
            }
        }, { noAck: false });

    } catch (error) {
        logger.error(`Error in supervisor. ${error.message}`);
    }
}

startSupervisor();
