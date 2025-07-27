

const {getLatestUtilizationData,getPricingList,calculateQuote} = require("./excelReader");
  
  const getLatestUtilization = async (req, res) => {
    try {
      const data = await getLatestUtilizationData();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch utilization data' });
      
    }
  };
  
  const getPricing = async (req, res) => {
    try {
      const pricing = await getPricingList();
      res.json(pricing);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch pricing list' });
    }
  };
  
  const postQuote = async (req, res) => {
    const { warehouse, storageType, pallets } = req.body;
    try {
      if (!warehouse || !storageType || isNaN(pallets)) {
        return res.status(400).json({ error: 'Missing or invalid input' });
      }
      
      const quote = await calculateQuote( warehouse, storageType, pallets);
      res.json({ quote });
       
    } catch (error) {
      res.status(400).json({ error: "faild to calculate quote" });
    }
  };
  
  module.exports = {
    getLatestUtilization,
    getPricing,
    postQuote
  };
  