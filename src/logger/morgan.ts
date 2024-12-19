import morgan from 'morgan';
// import morgan, { StreamOptions } from 'morgan'
// import logger from './logger'

// Define stream and output logs through winston instead of the default console
/* const stream: StreamOptions = {
  write: (message) => logger.http(message.trim()), // Use winston's http log level
} */

// Define morgan middleware with custom stream and combined log format
const morganMiddleware = morgan('dev');

export default morganMiddleware;
