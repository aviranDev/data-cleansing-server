import cors from 'cors';
import config from '../configuration/config';

const corsOptions: cors.CorsOptions = {
	origin: config.origin,
	credentials: true,
};

export default cors(corsOptions);
