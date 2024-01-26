const cluster = require('cluster');
const os = require('os');
const logger = require('./util/logger');
const startSupervisor = require('./supervisor');

if (cluster.isMaster) {
    const numCPUs = os.cpus().length;
    logger.info(`Master ${process.pid} is running with ${numCPUs} workers`);

    // Fork workers.
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('fork', worker => {
        logger.info(`Forked worker ${worker.process.pid}`);
    });

    cluster.on('exit', (worker, code, signal) => {
        logger.info(`Worker ${worker.process.pid} died, restarting...`);
        cluster.fork();
    });

    // start the supervisor in the master process
    if (process.env.START_SUPERVISOR === 'true') {
        startSupervisor();
    }
} else {
    // Workers can share any TCP connection
    require('./worker');
    logger.info(`Worker ${process.pid} started`);
}
