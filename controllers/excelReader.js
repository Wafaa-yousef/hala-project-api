
const xlsx = require('xlsx');
const path = require('path');

const EXCEL_PATH =path.join(process.env.EXCEL_FILE_PATH || __dirname, '../uploads/Hala_Warehouse_Test.xlsx');


function loadData(){
  return xlsx.readFile(EXCEL_PATH);
}

function getLatestUtilizationData() {
  try {
    const trends = getUtilizationTrends();

    const result = trends.map(entry => {
      const sortedTrend = entry.trend.sort((a, b) => Number(b.week) - Number(a.week)); // Descending
      const latest = sortedTrend[0];

      return {
        warehouse: entry.warehouse,
        totalUtilization: latest.utilization,
        week: latest.week
      };
    });

    return result;
  } catch (error) {
    console.error(" Error in getLatestUtilizationData():", error.message);
    return [];
  }
}


function getLatestWarehouseUtilization(warehouseName) {
  try {
    const loadedData = loadData();
    const sheet = loadedData.Sheets[loadedData.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    const warehouseWeekMap = {};

    data.forEach(row => {
      const warehouse = String(row["Warehouse Name"] || "").trim();
      const week = Number(row["Week Number"]);
      let utilization = row["Warehouse Uti %"];

      if (!warehouse || !week || utilization === undefined) return;

      // Normalize utilization
      utilization = typeof utilization === "string"
        ? parseFloat(utilization.replace("%", ""))
        : Number(utilization);

      const key = `${warehouse}-${week}`;

      if (!warehouseWeekMap[key]) {
        warehouseWeekMap[key] = { warehouse, week, total: 0 };
      }

      warehouseWeekMap[key].total += utilization;
    });

    
    const resultMap = {};
    Object.values(warehouseWeekMap).forEach(({ warehouse, week, total }) => {
      if (!resultMap[warehouse]) resultMap[warehouse] = [];
      resultMap[warehouse].push({ week, utilization: Number(total.toFixed(2)) });
    });

   
    const utilizationList = resultMap[warehouseName];
    if (!utilizationList || utilizationList.length === 0) return 0;

    const latestWeek = Math.max(...utilizationList.map(u => u.week));
    const latest = utilizationList.find(u => u.week === latestWeek);

    return latest.utilization;
  } catch (error) {
    console.error("Error in getLatestWarehouseUtilization:", error);
    return 0;
  }
}



function getPricingList() {
  const loadedData= loadData();
  const sheet = loadedData.Sheets[loadedData.SheetNames[1]]; // Assuming second sheet is pricing
  const pricingData = xlsx.utils.sheet_to_json(sheet);

  // console.log(pricingData)
 return pricingData.map(p => ({
    warehouse: p['Warehouse'],
    dryStoragePrice: p['Dry Storage Price (Pallet/Month)'],
    tempControlledPrice: p['Temp-Controlled Price (Pallet/Month)']
  }));
}

function getWarehouseCapacity(warehouseName) {
  const workbook =loadData();
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = xlsx.utils.sheet_to_json(sheet);

  // Clean and match the latest row with the matching warehouse
  const matchingRows = data.filter(entry =>
    entry['Warehouse Name']?.toLowerCase().trim() === warehouseName.toLowerCase().trim()
  );

  if (matchingRows.length === 0) return null;

  
  const lastEntry = matchingRows[matchingRows.length - 1];

  const capacity = lastEntry[' Warehouse Capacity ']; 

  return capacity ?? null;
}
async function calculateQuote(warehouse, storageType, pallets) {
  const pricing = getPricingList();

  const capacity=getWarehouseCapacity(warehouse)
  console.log(capacity)
  const warehouseEntry = pricing.find(p => p.warehouse === warehouse);
  if (!warehouseEntry) {
    throw new Error('Warehouse not found');
  }

  
  let pricePerPallet;
  if (storageType === 'dry') {
    pricePerPallet = warehouseEntry.dryStoragePrice;
  } else if (storageType === 'temp-controlled') {
    pricePerPallet = warehouseEntry.tempControlledPrice;
  } else {
    throw new Error('Invalid storage type');
  }

 
  const latestUtilizations = getLatestUtilizationData();

  const warehouseData = latestUtilizations.find(w => w.warehouse === warehouse);

  if (!warehouseData) {
    throw new Error("Utilization data for the warehouse not found");
  }

  let { totalUtilization, week: latestWeek } = warehouseData;
  totalUtilization*=100
  console.log("totalu",totalUtilization)
    Math.round(totalUtilization);
    let availablePallets =Math.round(capacity-(capacity*totalUtilization/100));
    console.log(availablePallets)
    if (pallets > availablePallets)
     return({availablePallets})
    else{
  const basePrice = pricePerPallet * pallets
      
  
  let surchargeApplied = false;
  let totalPrice = basePrice;

  if (totalUtilization > 60) {
    totalPrice *= 1.15; 
    surchargeApplied = true;
  }

  
  return {
    pricePerPallet,
    basePrice: Math.round(basePrice * 100) / 100,
    totalUtilization: Math.round(totalUtilization * 100) / 100,
    surchargeApplied,
    totalPrice: Math.round(totalPrice * 100) / 100,
    week: latestWeek,
    availablePallets
  };
}}


function getUtilizationTrends() {
  try {
    const wb = loadData();
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);


    const warehouseWeekMap = {};

    data.forEach(row => {
      const warehouse = row["Warehouse Name"];
      const week = row["Week Number"];
      let utilization = row["Warehouse Uti %"];

      if (!warehouse || !week || utilization === undefined) return;

      
      utilization = typeof utilization === 'string'
        ? parseFloat(utilization.replace('%', ''))
        : Number(utilization);

      const key = `${warehouse}-${week}`;

      
      if (!warehouseWeekMap[key]) {
        warehouseWeekMap[key] = { warehouse, week, total: 0 };
      }

      warehouseWeekMap[key].total += utilization;
    });

    
    const resultMap = {};

    Object.values(warehouseWeekMap).forEach(({ warehouse, week, total }) => {
      if (!resultMap[warehouse]) resultMap[warehouse] = [];
      resultMap[warehouse].push({
        week,
        utilization: Number(total.toFixed(2))
      });
    });

    
    return Object.entries(resultMap).map(([warehouse, trend]) => ({
      warehouse,
      trend: trend.sort((a, b) => Number(a.week) - Number(b.week))
    }));

  } catch (err) {
    console.error(" Error in getUtilizationTrends():", err.message);
    throw err;
  }
}


module.exports = {
  getLatestUtilizationData,
  getPricingList,
  calculateQuote,
  getUtilizationTrends

};
