
const  {getUtilizationTrends} = require("./excelReader");

const getUtilizationTrendsHandler = async (req, res) => {
  try {
    const trends = await getUtilizationTrends();
    console.log(trends)
    res.json(trends);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch utilization trends' });
    
  }
};

module.exports = {
  getUtilizationTrends: getUtilizationTrendsHandler
};
