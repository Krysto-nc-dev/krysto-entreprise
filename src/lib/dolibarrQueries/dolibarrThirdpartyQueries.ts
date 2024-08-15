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

// Fonction générique pour effectuer des requêtes DELETE à l'API Dolibarr
async function dolibarrDelete(endpoint: string) {
    try {
        const response = await fetch(`${BASE_URL}/${endpoint}`, {
            method: 'DELETE',
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
        console.error(`Erreur lors de l'appel API DELETE à ${endpoint}:`, error);
        throw error;
    }
}

// Fonction pour récupérer la liste des tiers
export async function getThirdparties(params: Record<string, string | number> = {}) {
    return await dolibarrGet('thirdparties', params);
}

// Fonction pour récupérer un tiers spécifique par ID
export async function getThirdpartyById(thirdpartyId: string | number) {
    return await dolibarrGet(`thirdparties/${thirdpartyId}`);
}

// Fonction pour créer un nouveau tiers
export async function createThirdparty(data: any) {
    return await dolibarrPost('thirdparties', data);
}

// Fonction pour mettre à jour un tiers par ID
export async function updateThirdparty(thirdpartyId: string | number, data: any) {
    return await dolibarrPost(`thirdparties/${thirdpartyId}`, data);
}

// Fonction pour supprimer un tiers par ID
export async function deleteThirdparty(thirdpartyId: string | number) {
    return await dolibarrDelete(`thirdparties/${thirdpartyId}`);
}

export default {
    getThirdparties,
    getThirdpartyById,
    createThirdparty,
    updateThirdparty,
    deleteThirdparty,
};
