/* import express, {Request, Response} from 'express';
import Record from '../models/Record';
import userAuth from '../middlewares/userAuth';
const router = express.Router();

// Search endpoint
router.get(
	'/search',
	userAuth,
	async (req: Request, res: Response): Promise<void> => {
		try {
			const {name} = req.query;

			if (!name) {
				res.status(400).json({message: 'Name query parameter is required.'});
				return;
			}

			// Case-insensitive search using regex
			const users = await Record.find({
				name: {$regex: new RegExp(name as string, 'i')},
			});

			if (users.length === 0) {
				res.status(404).json({message: 'No users found.'});
				return;
			}

			res.json(users);
		} catch (error) {
			console.error('Error during search:', error);
			res.status(500).json({message: 'Internal server error.'});
		}
	}
);

export default router;
 */
