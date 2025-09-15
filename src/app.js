const express = require("express")
const app=express()

app.use(express.json())

app.get('/',(req,res)=>{
    res.send("Event Management system API is running 😘")
})

module.exports=app