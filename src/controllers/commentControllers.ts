import express , { Request, Response } from "express";
import prisma from "../lib/prisma";
import jwt from 'jsonwebtoken'; 

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret'; 

const getUserIdFromRequest = (req: Request): number | null =>{
    const authHeader = req.headers.authorization; 

    if(!authHeader){
        return null; 
    }
    const token = authHeader.split(' ')[1]; 
    try{
        const decoded = jwt.verify(token, JWT_SECRET) as {userId:number}; 
        return decoded.userId; 
    } catch {
        return null; 
    }
}; 

export const addComment = async(req:Request, res: Response): Promise<void> =>{
    const userId = getUserIdFromRequest(req); 
    if(!userId){
        res.status(401).json({message: "Unauthorized"})
        return; 
    }

    const {text} = req.body; 
    const spotId = parseInt(req.params.spotId); 

    try {

        const rsvp = await prisma.rsvp.findFirst({
            where: {userId, pickupId: spotId}
        }); 

        if(!rsvp){
            res.status(403).json({message: 'You must RSVP before commenting'}); 
            return; 
        }

        const comment = await prisma.comment.create({
            data:{
                text, 
                userId, 
                pickupId: spotId
            }
        }); 
        res.status(201).json({message: "Comment Added", comment})
    } catch (err) {
        res.status(500).json({message: "Failed to add comment", error: err})
    }
}


//GET api/pickupSpots/:spotId/comments
export const getCommentsForSpot = async(req:Request, res:Response):Promise<void> =>{
    const spotId = parseInt(req.params.spotId); 


    try {
        const comments = await prisma.comment.findMany({
            where: {pickupId: spotId},
            orderBy: {createdAt: 'desc'},
            include: {
                user:{
                    select:{
                        id:true, 
                        name: true
                    }
                }
            }
        })
        res.json({spotId, comments})
    } catch (err) {
        res.status(500).json({message: "Failed to retrieve comments", error: err}); 
    }

}