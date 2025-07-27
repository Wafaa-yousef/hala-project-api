const express = require("express")

const router = express.Router(); 
const {getUtilizationTrends}=require('../../controllers/admin.js')
router.get("/trends",getUtilizationTrends,(data,req,res,next)=>{
    res.status(data.statusCode).json(data)
})
module.exports=router;