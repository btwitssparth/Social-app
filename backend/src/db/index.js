import mongoose from 'mongoose';

const connectDb= async ()=>{
    try{
        const connection= await mongoose.connect(`${process.env.MONGO_URI}`);
        console.log(`MongoDB connected successfully`);

    }

    catch(err){
        console.log(err);
        throw err;

    }
}
export default connectDb;