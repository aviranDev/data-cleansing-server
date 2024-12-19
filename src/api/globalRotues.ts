import {Router} from 'express';
import authRoute from '../routes/authRoute';
import userRoute from '../routes/userRoute';
import cronRoute from '../routes/scheduled-jobs';
import recodRoutes from '../routes/recordsRoute';
const router = Router();

router.use('/auth', authRoute);
router.use('/users', userRoute);
router.use('/records', recodRoutes);
router.use('/crons', cronRoute);

export default router;
