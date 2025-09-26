import dotenv from 'dotenv';
import e from 'express';
import {app} from './app.js';
import connectDb from './db/index.js'

dotenv.config(
    {
        path:'./.env'

    }
);

connectDb().then(()=>{
    app.listen(process.env.PORT || 5000,()=>{
        console.log(`Server running on port ${process.env.PORT || 5000}`);

    })
    
})
.catch((err)=>{
    console.log("Failed to connect to DB", err);
})