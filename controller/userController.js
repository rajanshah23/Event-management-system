const User=require("../models/userModel")
const bcrypt=require("bcrypt")
const registerUser=async(req,res)=>{

     if (req.body === undefined) {
      res.status(400).json({
        Message: "No data was sent",
      });
    }
const {username,email,password}=req.body
if(!email || !username || !password){
    return res.status(400).json({
        message:"Please provide email, username and password"
    })
}else {
    const existingUser=await User.findOne({where:{email}})
    if(existingUser){
        return res.status(400).json({
            message:"Email already exists"
        })
    }
}

const data=await User.create({
    username:username,
    email:email,
    password:bcrypt.hashSync(password,12) 
})
res.status(201).json({
        message: "User registered successfully",
        data
      });

}
module.exports=registerUser