import express, { Router } from "express";
import { rsvpToSpot, getRsvpForSpot, cancelRsvp} from "../controllers/rsvpController";

const router:Router = express.Router(); 

router.post("/:spotId/rsvp", rsvpToSpot); //POST /api/pickupSpots/:spotId/rsvp
router.get("/:spotId/rsvps", getRsvpForSpot) //GET /api/pickupSpots/:spotid/rsvps 
router.delete("/:spotId/rsvp", cancelRsvp) //DELETE /api/pickupSpots/:spotid/rsvp

export default router; 