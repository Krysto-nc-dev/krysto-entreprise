'use client';

import React, { useEffect, useState } from 'react';
import Table from '../../../../../components/table';
import { createColumnHelper, ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import DashboardHeading from '@/components/organisation/dashboardheading';

// Définition du type de données pour les services
type ServiceData = {
  id: string;
  label: string;
  description: string;
  price: number;
  imageUrl: string;
  organisationId: string;
};

// Configuration des colonnes du tableau
const columnHelper = createColumnHelper<ServiceData>();

const columns = (): ColumnDef<ServiceData, any>[] => [
  columnHelper.accessor('label', {
    header: 'Nom du Service',
  }),
  columnHelper.accessor('description', {
    header: 'Description',
  }),
  columnHelper.accessor('price', {
    header: 'Prix (XPF)',
    cell: info => `${info.getValue()} XPF`,
  }),
  columnHelper.accessor('imageUrl', {
    header: 'Image',
    cell: info => (
      <img src={info.getValue()} alt="Service" className="h-16 w-16 object-contain" />
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
        <DropdownMenuItem onClick={() => alert(`Voir images pour le service: ${row.original.id}`)}>
          Voir Images
        </DropdownMenuItem>
        <Link href={`services/${row.original.id}`}>
          <DropdownMenuItem>
            Détails
          </DropdownMenuItem>
        </Link>
        <DropdownMenuItem onClick={() => alert(`Modifier ${row.original.label}`)}>
          Modifier
        </DropdownMenuItem>
        {/* Ajoutez d'autres actions ici si nécessaire */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Composant principal de la page
const Page = ({ params }: { params: { organisationId: string } }) => {
  const [data, setData] = useState<ServiceData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('https://krystotest-erp.square.nc/api/index.php/products?mode=2', {
          headers: {
            'Content-Type': 'application/json',
            'dolapikey': "eqhTZrONIar69OQ16r3I0861z3BtOsRe",
          },
        });
        const result = await res.json();

        const transformedData = result.map((service: any) => ({
          id: service.id,
          label: service.label, // Utilisation de 'label' pour le nom du service
          description: service.description,
          price: parseFloat(service.price),
          imageUrl: '', // Ajoutez une URL d'image par défaut ou récupérez-la si disponible
          organisationId: service.array_options?.options_organisationid || 'N/A',
        }));

        const filteredServices = transformedData.filter(
          service => service.organisationId === params.organisationId
        );

        setData(filteredServices);
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
      <DashboardHeading
        title='Services'
        description="Une question ? N'hésitez pas à nous contacter !"
      />
      <Table columns={columns()} data={data} />
    </>
  );
};

export default Page;
