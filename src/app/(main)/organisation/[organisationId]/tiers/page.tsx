'use client';

import React, { useEffect, useState } from 'react';
import DashboardHeading from '@/components/organisation/dashboardheading';
import Table from '../../../../../components/table';
import { createColumnHelper, ColumnDef } from '@tanstack/react-table';
import { getThirdparties } from '@/lib/dolibarrQueries/dolibarrThirdpartyQueries';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
// Définition du type de données basé sur l'objet reçu !
type Data = {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  multicurrency_code: string;
  organisationId: string;
}

const columnHelper = createColumnHelper<Data>();

const columns = (organisationId: string): ColumnDef<Data, any>[] => [
  columnHelper.accessor('name', { header: 'Nom' }),
  columnHelper.accessor('address', { header: 'Adresse' }),
  columnHelper.accessor('phone', { header: 'Téléphone' }),
  columnHelper.accessor('email', { header: 'Email' }),
  columnHelper.accessor('multicurrency_code', { header: 'Devise' }),
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
        <Link href={`tiers/${row.original.id}`}>
          <DropdownMenuItem>
            Détails
          </DropdownMenuItem>
        </Link>
          <DropdownMenuItem onClick={() => alert(`Modifier ${row.original.name}`)}>
            Modifier
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => alert(`Supprimer ${row.original.name}`)}>
            Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

// Composant principal de la page
const Page = ({ params }: { params: { organisationId: string } }) => {
  const [data, setData] = useState<Data[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupération des tiers
        const result = await getThirdparties();

        // Transformation des données pour le tableau
        const transformedData = result.map((item: any) => ({
          id: item.id,
          name: item.name || 'N/A',
          address: item.address || 'N/A',
          phone: item.phone || 'N/A',
          email: item.email || 'N/A',
          multicurrency_code: item.multicurrency_code || 'N/A',
          organisationId: item.array_options?.options_organisationid || 'N/A',
        }));

        // Filtrage des tiers par organisationId
        const filteredData = transformedData.filter(item => item.organisationId === params.organisationId);

        setData(filteredData);
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
      <DashboardHeading title="Informations du Tiers" description="Voici les informations principales des tiers." />
      <Table columns={columns(params.organisationId)} data={data} />
    </>
  );
}

export default Page;
