'use client';

import React, { useEffect, useState } from 'react';
import DashboardHeading from '@/components/organisation/dashboardHeading';
import { ArrowBigLeft } from 'lucide-react';
import Link from 'next/link';
import { getWarehouseById } from '@/lib/dolibarrQueries/dolibarrWarehouseQueries';
import { getAllStockMovements } from '@/lib/dolibarrQueries/dolibarrStockMovementQueries';
import { getProducts } from '@/lib/dolibarrQueries/dolibarrProductQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Table from '@/components/Table';
import { createColumnHelper, ColumnDef } from '@tanstack/react-table';

// Fonction pour formater les dates
const formatDate = (timestamp: number | null): string => {
  if (!timestamp) return 'N/A';
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString();
};

const Page = ({ params }: { params: { organisationId: string; entrepotsId: string } }) => {
  // Déclaration des états
  const [warehouse, setWarehouse] = useState<any | null>(null);
  const [stockMovements, setStockMovements] = useState<any[]>([]);
  const [products, setProducts] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [totalStockQty, setTotalStockQty] = useState(0);
  const [totalStockValue, setTotalStockValue] = useState(0);
  const [productStockInfo, setProductStockInfo] = useState<any[]>([]);

  // Fonction pour récupérer les données depuis les API Dolibarr
  useEffect(() => {
    const fetchData = async () => {
      try {
        const warehouseData = await getWarehouseById(params.entrepotsId);
        setWarehouse(warehouseData);

        const movementsData = await getAllStockMovements();
        const filteredMovements = movementsData.filter(
          movement => movement.warehouse_id === params.entrepotsId
        );
        setStockMovements(filteredMovements);

        const productsData = await getProducts();
        const productsMap = productsData.reduce((acc: Record<string, any>, product: any) => {
          acc[product.id] = product;
          return acc;
        }, {});
        setProducts(productsMap);

        // Calcul de la quantité totale et de la valeur totale du stock
        let totalQty = 0;
        let totalValue = 0;
        const stockInfoByProduct: Record<string, { label: string, totalQty: number, totalValue: number }> = {};

        filteredMovements.forEach(movement => {
          const qty = parseFloat(movement.qty);
          const product = productsMap[movement.product_id];
          const price = product ? parseFloat(product.price) : 0;

          totalQty += qty;
          totalValue += qty * price;

          if (product) {
            if (!stockInfoByProduct[product.id]) {
              stockInfoByProduct[product.id] = {
                label: product.label,
                totalQty: 0,
                totalValue: 0,
              };
            }
            stockInfoByProduct[product.id].totalQty += qty;
            stockInfoByProduct[product.id].totalValue += qty * price;
          }
        });

        // Mise à jour des états avec les données calculées
        setTotalStockQty(totalQty);
        setTotalStockValue(totalValue);
        setProductStockInfo(Object.values(stockInfoByProduct));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.entrepotsId]);

  // Gestion de l'état de chargement
  if (loading) {
    return <div>Chargement...</div>;
  }

  // Gestion de l'affichage en cas d'absence de données pour l'entrepôt
  if (!warehouse) {
    return <div>Aucune donnée trouvée pour cet entrepôt.</div>;
  }

  // Définition des colonnes pour les tableaux
  const columnHelper = createColumnHelper<any>();

  const stockColumns: ColumnDef<any, any>[] = [
    columnHelper.accessor('label', {
      header: 'Produit',
    }),
    columnHelper.accessor('totalQty', {
      header: 'Quantité Totale',
    }),
    columnHelper.accessor('totalValue', {
      header: 'Valeur Totale (XPF)',
      cell: info => info.getValue().toFixed(2),
    }),
  ];

  const movementColumns: ColumnDef<any, any>[] = [
    columnHelper.accessor('inventorycode', {
      header: 'Code Mouvement',
    }),
    columnHelper.accessor('label', {
      header: 'Libellé Mouvement',
    }),
    columnHelper.accessor('qty', {
      header: 'Quantité',
    }),
    columnHelper.accessor('type', {
      header: 'Type de Mouvement',
      cell: info => info.getValue() === '0' ? 'Ajout' : 'Retrait',
    }),
    columnHelper.accessor('product_id', {
      header: 'Produit',
      cell: info => {
        const product = products[info.getValue()];
        return product ? product.label : 'Produit inconnu';
      },
    }),
    columnHelper.accessor('datem', {
      header: 'Date de Mouvement',
      cell: info => formatDate(info.getValue()),
    }),
  ];

  return (
    <>
      {/* En-tête du tableau de bord */}
      <div className="flex items-center justify-between w-full mb-4">
        <DashboardHeading
          title={`Entrepôt ${warehouse.ref || 'N/A'}`}
          description={`Détails de l'entrepôt ${warehouse.ref || 'N/A'}`}
        />
        <Link
          href={`/organisation/${params.organisationId}/entrepots`}
          className="inline-flex items-center bg-primary text-sm text-white mt-[-36px] px-4 py-1 rounded-md shadow-md hover:bg-primary-dark transition duration-300"
        >
          <ArrowBigLeft className="mr-2 h-5 w-5" />
          Retour
        </Link>
      </div>

      {/* Affichage de la quantité totale en stock et de la valeur totale du stock */}
      <div className="mb-8">
        <h2 className="text-xl font-bold">Quantité totale en stock: {totalStockQty}</h2>
        <h2 className="text-xl font-bold">Valeur totale du stock: {totalStockValue.toFixed(2)} XPF</h2>
      </div>

      {/* Tableau pour afficher le stock par produit */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Stock par Produit</CardTitle>
          </CardHeader>
          <CardContent>
            {productStockInfo.length > 0 ? (
              <Table columns={stockColumns} data={productStockInfo} />
            ) : (
              <p>Aucun produit trouvé pour cet entrepôt.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tableau pour afficher les mouvements de stock */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Mouvements de Stock</CardTitle>
          </CardHeader>
          <CardContent>
            {stockMovements.length > 0 ? (
              <Table columns={movementColumns} data={stockMovements} />
            ) : (
              <p>Aucun mouvement de stock trouvé pour cet entrepôt.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Page;
