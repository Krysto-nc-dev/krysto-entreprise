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

// Fonction pour récupérer la liste des propositions commerciales
export async function getProposals(params: Record<string, string | number> = {}) {
    return await dolibarrGet('proposals', params);
}

// Fonction pour récupérer un devis spécifique par ID
export async function getProposalById(proposalId: string) {
    return await dolibarrGet('proposals', { id: proposalId });
}

// Fonction pour créer une nouvelle proposition commerciale
export async function createProposal(data: any) {
    return await dolibarrPost('proposals', data);
}

// Fonction pour mettre à jour une proposition commerciale par ID
export async function updateProposal(id: string | number, data: any) {
    return await dolibarrPost(`proposals/${id}`, data);
}

// Fonction pour ajouter une ligne à une proposition commerciale par ID
export async function addProposalLine(id: string | number, lineData: any) {
    return await dolibarrPost(`proposals/${id}/line`, lineData);
}

// Fonction pour récupérer les lignes d'une proposition commerciale par ID
export async function getProposalLines(id: string | number, sqlfilters: string = '') {
    return await dolibarrGet(`proposals/${id}/lines`, { sqlfilters });
}

// Fonction pour fermer une proposition commerciale
export async function closeProposal(id: string | number, status: number, note_private?: string) {
    return await dolibarrPost(`proposals/${id}/close`, {
        status,
        note_private,
    });
}

// Fonction pour supprimer une ligne d'une proposition commerciale par ID
export async function deleteProposalLine(id: string | number, lineId: string | number) {
    return await dolibarrPost(`proposals/${id}/lines/${lineId}`, { method: 'DELETE' });
}

export default {
    getProposals,
    getProposalById,
    createProposal,
    updateProposal,
    addProposalLine,
    getProposalLines,
    closeProposal,
    deleteProposalLine,
};
