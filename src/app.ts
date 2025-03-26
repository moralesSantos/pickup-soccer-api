import express from 'express'
import cors from 'cors'; 
import dotenv from 'dotenv'
import authRoutes from './routes/auth'
import spotRoutes from './routes/pickupSpots'

dotenv.config(); 
const app = express(); 

app.use(cors()); //Enables cors(frontend/backend connection); 
app.use(express.json()); //Parses incoming json requests 

//routes
app.use("/api/auth", authRoutes); //mounts you auth router at api/auth
app.use("/api/pickupSpots", spotRoutes); 
app.get("/", (req,res)=>{
    res.send("Soccer pickup is up and running")
})


export default app; 


