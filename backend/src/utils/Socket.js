import {Server} from "socket.io"
import jwt from "jsonwebtoken"
import { ApiError } from "./apiError.js";

function initSocket(server){
    const io= new Server(server,{
        cors:{
            origin:process.env.CORS || "http://localhost:5137",
            methods:["GET","POST"],
            credentials:true,

        },
    });

    io.use((socket,next)=>{
        try{
            const token =
            socket.handshake.auth?.token ||
            socket.handshake.headers?.authorization?.split(" ")[1];

            if(!token){
                return new ApiError(401,"Unauthoerized request")

            }

            const decoded = jwt.verify(token,process.env.JWT_SECRET);
            socket.data.user = {id:decoded.id};
            next();

        }
        catch(e){
            next(new Error("unauthorized"))
        }
    });

    io.on("connection",(socket)=>{
        const userId = socket.data.user.id;
        console.log(`User connected: ${userId}`);

        socket.join(userId);

        socket.on("joiRoom",(roomId)=>{
            socket.join(roomId);
        });

        socket.on("sendMessage",(payload)=>{
            const room = payload.chatId || [userId,payload.to].sort().join("_");
            io.to(room).emit("newMessage",{
                chatId:room,
                sender:userId,
                text:payload.text,
                createdAt: new Date(),
            });
        });
        socket.on("disconnect",()=>{
            console.log("socket disconnected",socket.id);

        })

    })
    return io;
}

export {initSocket};