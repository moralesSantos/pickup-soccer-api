import express, {Router} from 'express'; 
import { createPickupSpot, getAllPickupSpots } from '../controllers/pickupSpotController';

const router:Router = express.Router(); 

router.post("/", createPickupSpot); //post api/pickupSpots
router.get("/", getAllPickupSpots); //get api/pickupSpots 

export default router; 