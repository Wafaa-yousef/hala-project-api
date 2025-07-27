const express = require("express")

const router = express.Router();

router.use("/customer",require('./customer.js'))
router.use("/admin",require('./admin.js'))

module.exports=router;