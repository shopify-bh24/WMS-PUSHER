import axios from 'axios';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:5000';

export const saveOrders = async (orders: any[]) => {
    try {
        const response = await axios.post(`${BACKEND_API_URL}/api/orders/sync`, {
            orders: orders
        });
        return response.data.orders;
    } catch (error: any) {
        console.error('Error saving orders to backend:', error);
        throw new Error(error.response?.data?.message || 'Failed to save orders');
    }
}; 