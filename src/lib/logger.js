import pino from 'pino';

export const logger = pino({
	level: 'info'
});

export default logger;
