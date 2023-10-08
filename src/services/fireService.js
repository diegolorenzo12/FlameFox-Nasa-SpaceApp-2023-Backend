const axion = require('axios')
const apiCfg = require('../configs/sciapi')


const downloadRawFireData = async (area) =>{
    const date = new Date().toISOString().split("T")[0];
    const raw = axios.get(`https://firms.modaps.eosdis.nasa.gov/api/api/area/csv/
    ${apiCfg.FIRMS_KEY}/VIIRS_SNPP_NRT/${area}/1`)  
} 