require('dotenv').config();

module.exports = {
    rabbitMQ: {
        connectionString: process.env.RABBITMQ_URL || 'amqp://localhost',
        taskQueue: 'task_queue',
        resultsQueue: 'results_queue'
    },
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379
    },
    taskSettings: {
        highComplexityDelay: 5000,
        lowComplexityDelay: 1000,
        cacheExpiration: 3600 // 1 hour
    }
};
