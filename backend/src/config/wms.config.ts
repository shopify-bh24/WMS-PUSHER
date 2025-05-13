import dotenv from 'dotenv';

dotenv.config();

interface WMSConfig {
  API_URL: string;
  API_KEY: string;
  API_SECRET: string;
  WAREHOUSE_ID: string;
  CONNECTION_TIMEOUT: number;
}

const wmsConfig: WMSConfig = {
  API_URL: process.env.WMS_API_URL || '',
  API_KEY: process.env.WMS_API_KEY || '',
  API_SECRET: process.env.WMS_API_SECRET || '',
  WAREHOUSE_ID: process.env.WMS_WAREHOUSE_ID || '',
  CONNECTION_TIMEOUT: parseInt(process.env.WMS_CONNECTION_TIMEOUT || '30000', 10),
};

export default wmsConfig; 