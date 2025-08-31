import mongoose from 'mongoose'
import {DB_NAME} from '../constants.js'

//this method use for the Database connection
const connectDB= async ()=>{
   try {
     const connectionInstances= await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
     console.log(`\n MONGODB connected !! DB HOST:${
      connectionInstances.connection.host}`);
     
   } catch (error) {
      console.log("MONGODB connection Failed:",error);
      process.exit(1)
      
   }
}

export default connectDB;