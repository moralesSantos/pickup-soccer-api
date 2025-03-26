import express, {Router} from 'express'
import { getMyComments, getMyPickupSpots, getMyRsvps } from '../controllers/meController'

const router: Router = express.Router(); 

router.get("/rsvps", getMyRsvps); 
router.get("/getMyComments", getMyComments); 
router.get("/getMyPickupSpots", getMyPickupSpots); 

export default router;

