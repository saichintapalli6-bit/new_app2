import { Platform } from 'react-native';

const LOCAL_IP = '192.168.1.120';
const RENDER_URL = 'https://smart-vehicle-procurement-app.onrender.com';
const USE_PRODUCTION = true; // Enabled for permanent storage

// Web deployment auto-detection
const isDeployedWeb = Platform.OS === 'web' && typeof window !== 'undefined' && window.location.hostname !== 'localhost';

export const API_BASE = (USE_PRODUCTION || isDeployedWeb)
    ? RENDER_URL
    : (Platform.OS === 'web' ? 'http://localhost:8000' : `http://${LOCAL_IP}:8000`);

export const ENDPOINTS = {
    LOGIN: `${API_BASE}/api/login`,
    REGISTER: `${API_BASE}/api/register`,
    BROWSE_VEHICLES: `${API_BASE}/api/browse-vehicles`,
    PURCHASE: `${API_BASE}/api/purchase-vehicle`,
    // Admin
    ADMIN_BUYERS: `${API_BASE}/api/admin/buyers`,
    ADMIN_SELLERS: `${API_BASE}/api/admin/sellers`,
    ADMIN_ACTIVATE_BUYER: `${API_BASE}/api/admin/activate-buyer`,
    ADMIN_ACTIVATE_SELLER: `${API_BASE}/api/admin/activate-seller`,
    ADMIN_TRANSACTIONS: `${API_BASE}/api/admin/transactions`,
    ADMIN_APPROVE_TRANSACTION: `${API_BASE}/api/admin/approve-transaction`,
    // Seller
    SELLER_ADD_VEHICLE: `${API_BASE}/api/seller/add-vehicle`,
    SELLER_VEHICLE_HISTORY: `${API_BASE}/api/seller/vehicle-history`,
    SELLER_UPDATE_TRANSACTION: `${API_BASE}/api/seller/update-transaction`,
    // Buyer
    BUYER_TRANSACTIONS: `${API_BASE}/api/buyer/transactions`,
    // Admin extra
    ADMIN_DELETE_USER: `${API_BASE}/api/admin/delete-user`,
};
