import { Platform } from 'react-native';

const LOCAL_IP = '192.168.1.120';
const RENDER_URL = 'https://new-app-6zc1.onrender.com';

// Auto-detect: use localhost for web (local dev), Render for mobile
export const API_BASE =
    Platform.OS === 'web'
        ? 'http://localhost:8000'
        : `http://${LOCAL_IP}:8000`;

// To switch to production (Render), comment above and uncomment below:
// export const API_BASE = RENDER_URL;

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
