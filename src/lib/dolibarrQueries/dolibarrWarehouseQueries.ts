const BASE_URL = "https://krystotest-erp.square.nc/api/index.php";
const DOLAPIKEY = "eqhTZrONIar69OQ16r3I0861z3BtOsRe"; // Remplacez par votre clé API

// Fonction générique pour effectuer des requêtes GET à l'API Dolibarr
async function dolibarrGet(endpoint: string, params: Record<string, string | number> = {}) {
    const url = new URL(`${BASE_URL}/${endpoint}`);

    // Ajout des paramètres de requête à l'URL
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
            throw new Error(`Erreur HTTP: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Erreur lors de l'appel API GET à ${endpoint}:`, error);
        throw error;
    }
}

// Fonction pour récupérer une liste d'entrepôts ayant le même organisationId spécifique
export async function getWarehousesByOrganisation(organisationId: string) {
    const allWarehouses = await dolibarrGet('warehouses');
    return allWarehouses.filter(warehouse => 
        warehouse.array_options && warehouse.array_options.options_organisationid === organisationId
    );
}

// Fonction générique pour effectuer des requêtes POST à l'API Dolibarr
async function dolibarrPost(endpoint: string, data: any) {
    try {
        const response = await fetch(`${BASE_URL}/${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'DOLAPIKEY': DOLAPIKEY,
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Erreur lors de l'appel API POST à ${endpoint}:`, error);
        throw error;
    }
}

// Fonction pour récupérer la liste des entrepôts
export async function getWarehouses(params: Record<string, string | number> = {}) {
    return await dolibarrGet('warehouses', params);
}

// Fonction pour récupérer un entrepôt spécifique par ID
export async function getWarehouseById(id: string | number) {
    if (!id) {
        throw new Error('Warehouse ID is undefined or null');
    }
    return await dolibarrGet(`warehouses/${id}`);
}

// Fonction pour récupérer les mouvements de stock d'un entrepôt par ID
export async function getStockMovementsByWarehouseId(warehouseId: string | number, params: Record<string, string | number> = {}) {
    if (!warehouseId) {
        throw new Error('Warehouse ID is undefined or null');
    }
    return await dolibarrGet('stockmovements', {
        ...params,
        sqlfilters: `(t.warehouse_id:=:${warehouseId})`
    });
}

// Fonction pour créer un nouvel entrepôt
export async function createWarehouse(data: any) {
    return await dolibarrPost('warehouses', data);
}

// Fonction pour mettre à jour un entrepôt par ID
export async function updateWarehouse(id: string | number, data: any) {
    return await dolibarrPost(`warehouses/${id}`, data);
}

// Fonction pour supprimer un entrepôt par ID
export async function deleteWarehouse(id: string | number) {
    return await dolibarrPost(`warehouses/${id}`, { method: 'DELETE' });
}

export default {
    getWarehouses,
    getWarehouseById,
    getStockMovementsByWarehouseId,  // Export the new function
    createWarehouse,
    updateWarehouse,
    deleteWarehouse,
    getWarehousesByOrganisation
};
