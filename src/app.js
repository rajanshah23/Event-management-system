const express = require("express")
const app=express()
const userRoute=require("../routes/userRoute")
const eventRoute = require("../routes/eventRoute");
const bookingRoute = require("../routes/bookingRoute");
 const paymentRoute = require("../routes/paymentRoute");

app.use(express.json())
app.use('/api',userRoute)
app.use("/api",eventRoute);
app.use("/api", bookingRoute);
 app.use("/api", paymentRoute);
app.get('/',(req,res)=>{
    res.send("EventHub API is running 😘")
})

module.exports=app