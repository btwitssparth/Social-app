import dotenv from 'dotenv';
import e from 'express';
import {app} from './app.js';
import connectDb from './db/index.js'
import http from 'http';
import { initSocket } from './utils/Socket.js';

dotenv.config(
    {
        path:'./.env'

    }
);

const server= http.createServer(app);

const io= initSocket(server);

app.set("io",io)

connectDb().then(()=>{
    server .listen(process.env.PORT || 5000,()=>{
        console.log(`Server running on port ${process.env.PORT || 5000}`);

    })
    
})
.catch((err)=>{
    console.log("Failed to connect to DB", err);
})