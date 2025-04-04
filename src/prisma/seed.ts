import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient(); 

async function main() {
    //create user 

    const user = await prisma.user.create({
        data: {
            name: "Test user", 
            email: "text@example.com", 
            password: "testpassword1"
        }
    }); 

    //create a pickupSpot 
    const spot = await prisma.pickupSpot.create({
        data: {
            location: "Hooker Fields", 
            date: new Date("2025-04-05"), 
            time: "6:30 PM", 
            maxPlayers: 14, 
            notes: "Bring white and black shirt", 
            createdById: user.id
        }
    })

    const rsvp = await prisma.rsvp.create({
        data: {
            userId: user.id, 
            pickupId: spot.id,
            gameSlot: 1,
        }
        
    })
    
    console.log("Seed data created ✅");

}

main().catch(e=>console.error(e)).finally(()=>
    prisma.$disconnect()); 