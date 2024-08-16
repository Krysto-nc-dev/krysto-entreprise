'use client';

import React, { useEffect, useState } from 'react';
import Table from '../../../../../components/Table';
import { createColumnHelper, ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { getProducts } from '@/lib/dolibarrQueries/dolibarrProductQueries';

// Définition du type de données pour les produits
type ProductData = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
};

// Configuration des colonnes du tableau
const columnHelper = createColumnHelper<ProductData>();

const columns = (): ColumnDef<ProductData, any>[] => [
  columnHelper.accessor('name', {
    header: 'Nom du Produit',
  }),
  columnHelper.accessor('description', {
    header: 'Description',
  }),
  columnHelper.accessor('price', {
    header: 'Prix (XPF)',
    cell: info => `${info.getValue()} XPF`,
  }),
  columnHelper.accessor('stock', {
    header: 'Stock',
  }),
  columnHelper.accessor('imageUrl', {
    header: 'Image',
    cell: info => (
      <img src={info.getValue()} alt="Product" className="h-16 w-16 object-contain" />
    ),
  }),
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => <ActionsCell row={row} />,
  }
];

// Composant pour les actions
const ActionsCell: React.FC<{ row: any }> = ({ row }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => alert(`Voir images pour le produit: ${row.original.id}`)}>
          Voir Images
        </DropdownMenuItem>
        <Link href={`produits/${row.original.id}`}>
          <DropdownMenuItem>
            Détails
          </DropdownMenuItem>
        </Link>
        <DropdownMenuItem onClick={() => alert(`Modifier ${row.original.name}`)}>
          Modifier
        </DropdownMenuItem>
        {/* Ajoutez d'autres actions ici si nécessaire */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Composant principal de la page
const Page = ({ params }: { params: { organisationId: string } }) => {
  const [data, setData] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getProducts({ mode: 1 });

        const transformedData = result.map((product: any) => ({
          id: product.id,
          name: product.label, // Utilisation du label au lieu du nom
          description: product.description,
          price: parseFloat(product.price), // Parse to number
          stock: product.stock_reel|| 0,
          imageUrl: product.imageUrl,
          organisationId: product.array_options?.options_organisationid || 'N/A',
        }));

        const filteredProducts = transformedData.filter(
          product => product.organisationId === params.organisationId
        );

        setData(filteredProducts);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.organisationId]);

  if (loading) return <div>Chargement...</div>;

  return (
    <>
      <h1>Produits</h1>
      <Table columns={columns()} data={data} />
    </>
  );
};

export default Page;
