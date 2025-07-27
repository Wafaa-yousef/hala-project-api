const express = require("express")

const router = express.Router(); 
  const { getLatestUtilization, getPricing, postQuote } = require('../../controllers/customer.js');

  router.get('/latestUtilizationData',getLatestUtilization,(data,req,res,next)=>{
    res.status(data.statusCode).json(data)
    
})
  
    router.get('/pricingList',getPricing,(data,req,res,next)=>{
      res.status(data.statusCode).json(data)
  })
    router.post('/quote',postQuote,(data,req,res,next)=>{
      res.status(data.statusCode).json(data)
  })
  module.exports = router;