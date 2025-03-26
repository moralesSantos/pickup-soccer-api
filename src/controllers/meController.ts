import { Request, Response } from "express";
import prisma from "../lib/prisma";
import jwt from 'jsonwebtoken'; 

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

const getUserIdFromRequest = (req:Request): number | null =>{
    const authHeader = req.headers.authorization; 

    if(!authHeader){
        return null; 
    }
    const token = authHeader.split(' ')[1]; 

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as {userId: number}; 
        return decoded.userId; 

    } catch (err) {
        return null; 
    }
}

export const getMyPickupSpots = async (req:Request, res:Response): Promise<void> =>{
    const userId = getUserIdFromRequest(req); 

    if(!userId){
        res.status(401).json({message: "Unauthorized"})
        return; 
    }

    try {
        const spots = await prisma.pickupSpot.findMany({
            where: {createdById: userId},
            orderBy: {date: 'desc'},  
        })
        res.json({spots}); 
    } catch (err) {
        res.status(500).json({message:"Failed to retrieve your pickup spots" , error:err})
    }
}

export const getMyRsvps = async (req:Request, res: Response): Promise<void> =>{
    const userId = getUserIdFromRequest(req); 

    if(!userId){
        res.status(401).json({message: "Unauthorized"})
        return; 
    }
    try {
        const rsvps = await prisma.rsvp.findMany({
            where:{userId},
            orderBy: { createdAt: 'desc'}, 
            include: {
                pickup: {
                    select: {
                        id: true,
                        location: true,
                        date: true,
                        time: true,
                        maxPlayers: true
                    }
                }
            }
        }); 
        res.json({rsvps}); 
    } catch (err) {
        res.status(500).json({message: "failed to get your rsvps", error:err})
    }
}

export const getMyComments = async (req:Request, res:Response): Promise<void>=>{
    const userId = getUserIdFromRequest(req); 

    if(!userId){
        res.status(401).json({message: "Unauthorized"})
        return; 
    }

    try {
        const comments = await prisma.comment.findMany({
            where: {userId}, 
            include: {
                pickup: true
            }, 
            orderBy: {
                createdAt: 'desc'
            }
        }); 
        res.json({comments}); 
        
    } catch (err) {
        res.status(500).json({message: "failed to get your comments", error:err})
    }

}




