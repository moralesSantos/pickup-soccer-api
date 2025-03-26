import express, {Router} from 'express'; 
import { addComment, getCommentsForSpot } from '../controllers/commentControllers';

const router: Router = express.Router(); 

router.post('/:spotId/comments', addComment); 
router.get('/:spotId/comments', getCommentsForSpot); 

export default router; 