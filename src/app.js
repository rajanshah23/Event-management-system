const express = require("express")
const app=express()
const userRoute=require("../routes/userRoute")

app.use(express.json())
app.use('/api',userRoute)
app.get('/',(req,res)=>{
    res.send("Event Management system API is running 😘")
})

module.exports=app