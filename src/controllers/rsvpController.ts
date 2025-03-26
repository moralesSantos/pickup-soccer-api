import { Request, Response } from "express";
import prisma from "../lib/prisma";
import jwt from "jsonwebtoken";
import { error } from "console";

const JWT_SECRET = process.env.JWT_Secret || 'dev_secret'; 

export const getUserIdFromRequest = (req:Request):number | null =>{
    const authHeader = req.headers.authorization; 
    if(!authHeader) return null; 

    const token = authHeader.split(' ')[1]; 

    try {
        const decoded = jwt.verify(token,JWT_SECRET) as {userId:number}; 
        return decoded.userId; 
    } catch{
        return null
    }
}

export const rsvpToSpot = async (req:Request, res:Response): Promise<void> =>{
    const userId = getUserIdFromRequest(req);

    if (!userId) {
        res.status(401).json({message: "Unauthorized"}); 
        return; 
    }

    const spotId = parseInt(req.params.spotId); 

    try {
        const existingRsvp = await prisma.rsvp.findFirst({
            where: {userId, pickupId: spotId}
        })

        if (existingRsvp){
            res.status(400).json({message: "You already RSVP-ed to this pickup spot"})
            return; 
        }

        const currentRsvps = await prisma.rsvp.findMany({
            where: {userId, pickupId: spotId}
        }); 

        const spot = await prisma.pickupSpot.findUnique({
            where: {id: spotId}
        })

        if (!spot) {
            res.status(404).json({message: 'Pickup spot not found'}); 
            return; 
        }

        //caculate slot based on total rsvps 
        const currentSlot = Math.floor(currentRsvps.length / spot.maxPlayers) + 1; 

        const newRsvp = await prisma.rsvp.create({
            data: {
                userId, 
                pickupId: spotId, 
                gameSlot: currentSlot
            }
        }); 
        res.status(201).json({message: "RSVP successful", rsvp: newRsvp})

    } catch (error) {
        res.status(201).json({message: "RSVP failed", error:error})        
    }
}

export const getRsvpForSpot = async(req:Request, res:Response): Promise<void> =>{
    const spotId = parseInt(req.params.spotId); 

    try {
        const rsvps = await prisma.rsvp.findMany({
            where: {pickupId: spotId}, 
            orderBy: {gameSlot: 'asc'},
            include: {
                user:{
                    select: {
                        id: true, 
                        name: true
                    }
                }
            }
        })
        res.json({spotId, rsvps}); 
    } catch (err){
        res.status(500).json({message: "Failed to fetch rsvps", error: err})
    }
}

export const cancelRsvp = async(req:Request, res:Response):Promise<void> =>{
    const userId = getUserIdFromRequest(req); 
    if(!userId){
        res.status(401).json({message: "Unauthorized"})
        return;
    }
    const spotId = parseInt(req.params.spotId); 

    try {
        const rsvp = await prisma.rsvp.findFirst({
            where: {userId, pickupId:spotId}
        }); 

        if(!rsvp){
            res.status(404).json({message: "RSVP not found for this user and spot"}); 
            return; 
        }

        await prisma.rsvp.delete({
            where: {id: rsvp.id}
        }); 
        res.json({message: "RSVP canceled successfully"})
    } catch (err) {
        res.status(500).json({message: "Failed to cancel RSVP", error: err})
    }

}