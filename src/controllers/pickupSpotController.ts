import { Response, Request } from "express";
import prisma from "../lib/prisma";
import jwt from 'jsonwebtoken'; 
import { error } from "console";

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret'; 

// Helper: Get user id from jwt
const getUserIdFromRequest = (req:Request): number | null =>{
    const authHeader = req.headers.authorization; 
    if(!authHeader){
        return null; 
    }
    const token = authHeader.split(' ')[1]; 
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as {userId:number}; 
        return decoded.userId; 
    } catch (err) {
        return null;
    }
}; 

//Post api/spots - create a pickupSpot 
export const createPickupSpot = async (req:Request, res:Response):Promise<void> =>{
    const userId = getUserIdFromRequest(req); 

    if(!userId) {
        res.status(401).json({message: "User unauthorized"});
        return
    }

    const {location, date, time, maxPlayers, notes} = req.body; 

    try {
        const newSpot = await prisma.pickupSpot.create({
            data: {
                location, 
                date: new Date(date), 
                time, 
                maxPlayers,
                notes,
                createdById: userId
            }
        })
        res.status(201).json({message: "Pickup Spot created, " , spot: newSpot}); 
    } catch (err) {
        res.status(500).json({message: "Failed to create pickup spot", error: err})
    }
}

//Get api/spots - get all upcoming spots
export const getAllPickupSpots = async (req:Request, res:Response): Promise<void> =>{
    try {
        const pickupSpots = await prisma.pickupSpot.findMany({
            where: {
                date: {
                    gte: new Date(), //only show upcoming spots 
                }
            },
            orderBy: {
                date: 'asc'
            }, 
            include: {
                rsvps: true, 
                comments: true, 
                createdBy: {
                    select:{
                        id: true, 
                        name: true
                    }
                }
            }
        })
        res.json({pickupSpots}); 
    } catch (err) {
        res.status(500).json({message: "Failed to retrieve pickup spots ", error:err})
    }
}