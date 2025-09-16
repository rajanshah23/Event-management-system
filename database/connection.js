const mongoose =require("mongoose")
const { mongoUrl } = require("../config/config")
 
const connectDB=async ()=>{
    try {
         await mongoose.connect(mongoUrl)
         console.log("Database Connected to MongoDB successfully")
    } catch (error) {
        console.error("Error Connecting to database:",error)
        process.getMaxListeners(1);    }
}
module.exports=connectDB