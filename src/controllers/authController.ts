import { Request, response, Response } from "express";
import bcrypt from 'bcrypt'; 
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";
import { error } from "console";

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret'; 

export const register = async(req:Request, res:Response): Promise<void> =>{

  const {name,email,password} = req.body; 

  try { 
    const existingUser = await prisma.user.findUnique({where: {email}}); 
    if (existingUser){
      res.status(400).json({message: "User is already registererd"}); 
      return; 
    }
    const hashedPassword = await bcrypt.hash(password,10); 

    const user = await prisma.user.create({
      data: {name, email, password},
    }); 

    res.status(201).json({message: "User registered", user : {id:user.id, email:user.email }})
  } catch (err) {
    res.status(500).json({message: "Registration failed", error: err})
  }
}; 

export const login = async(req:Request, res:Response): Promise<void> =>{

  const {email,password} = req.body; 

  try {
    const user = await prisma.user.findUnique({where: {email}}); 
    if (!user) {
      res.status(401).json({message: "Invalid credentials"}); 
      return; 
    }
    const isMatch = await bcrypt.compare(password, user.password); 

    if (!isMatch) {
      res.status(401).json({message: "Invalid credentials"}); 
      return; 
    } 

    const token = jwt.sign({userId: user.id}, JWT_SECRET, {expiresIn: '7d'}); 

    res.json({token, user:{id:user.id, email: user.email, name:user.name}}); 


  } catch (err) {
    res.status(500).json({message: "Login failed", error: err}); 
  }

}
  