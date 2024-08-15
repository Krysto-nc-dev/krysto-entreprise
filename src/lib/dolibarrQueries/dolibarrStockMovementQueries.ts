const BASE_URL = "https://krystotest-erp.square.nc/api/index.php";
const DOLAPIKEY = "eqhTZrONIar69OQ16r3I0861z3BtOsRe";

// Function to perform GET requests to the Dolibarr API
async function dolibarrGet(endpoint: string, params: Record<string, string | number> = {}) {
    const url = new URL(`${BASE_URL}/${endpoint}`);

    // Add query parameters to the URL
    Object.keys(params).forEach(key => url.searchParams.append(key, String(params[key])));

    try {
        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'DOLAPIKEY': DOLAPIKEY,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Error during GET API call to ${endpoint}:`, error);
        throw error;
    }
}

// Function to get all stock movements without filters
export async function getAllStockMovements() {
    return await dolibarrGet('stockmovements');
}

// Function to get stock movements for a specific warehouse
export async function getStockMovementsByWarehouseId(warehouseId: string | number) {
    const sqlfilters = `(t.warehouse_id:=:${warehouseId})`;
    return await dolibarrGet('stockmovements', { sqlfilters });
}

// Export default functions
export default {
    getAllStockMovements,
    getStockMovementsByWarehouseId,
};
