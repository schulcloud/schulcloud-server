const app = require('./app');
const logger = require('./logger');

process
	.on('unhandledRejection', (reason, p) => {
		logger.error('Unhandled Rejection at: Promise ', p, ' reason: ', reason);
	});


const port = app.get('port');
const server = app.listen(port);

server.on('listening', () => {
	logger.log('info', `Schul-Cloud application started on http://${app.get('host')}:${port}`);
});
