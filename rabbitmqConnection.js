const amqp = require('amqplib');
const { rabbitMQ } = require('./config');
const logger = require('./util/logger');

async function connectRabbitMQ() {
    try {
        const connection = await amqp.connect(rabbitMQ.connectionString);
        const channel = await connection.createConfirmChannel();
        return channel;
    } catch (error) {
        logger.error("Error connecting to RabbitMQ.", error);
        throw error;
    }
}

module.exports = {
    connectRabbitMQ
};