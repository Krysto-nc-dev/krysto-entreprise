'use client';

import React, { useEffect, useState } from 'react';
import DashboardHeading from '@/components/organisation/dashboardheading';
import Table from '../../../../../components/table';
import { createColumnHelper, ColumnDef } from '@tanstack/react-table';
import { getWarehousesByOrganisation, deleteWarehouse } from '@/lib/dolibarrQueries/dolibarrWarehouseQueries';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, MoreHorizontal, Edit, Trash, Eye } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

// Définition du type de données basé sur l'objet reçu
type Data = {
  ref: string;
  label: string;
  lieu: string;
  id: string;  // Ajout de l'ID pour pouvoir supprimer
};

// Configuration des colonnes du tableau
const columnHelper = createColumnHelper<Data>();

const Page = ({ params }: { params: { organisationId: string } }) => {
  const [data, setData] = useState<Data[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getWarehousesByOrganisation(params.organisationId);

        console.log('Données reçues:', result);

        const transformedData = result.map((item: any) => ({
          id: item.id || 'N/A',  // Assurez-vous que l'ID est bien présent pour la suppression
          ref: item.ref || 'N/A',
          label: item.label || 'N/A',
          lieu: item.lieu || 'N/A',
        }));

        setData(transformedData);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.organisationId]);

  const handleDelete = async () => {
    if (!selectedWarehouseId) return;

    try {
      await deleteWarehouse(selectedWarehouseId);
      setData((prevData) => prevData.filter((warehouse) => warehouse.id !== selectedWarehouseId));
      toast({
        title: 'Succès',
        description: 'Entrepôt supprimé avec succès.',
      });
      setSelectedWarehouseId(null);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Une erreur s\'est produite lors de la suppression.',
      });
    }
  };

  const columns: ColumnDef<Data, any>[] = [
    columnHelper.accessor('ref', {
      header: 'Référence',
    }),
    columnHelper.accessor('label', {
      header: 'Label',
    }),
    columnHelper.accessor('lieu', {
      header: 'Lieux',
    }),
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost">
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`entrepots/${row.original.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  Détails
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/organisation/${row.original.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Modifier
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Button variant="ghost" onClick={() => setSelectedWarehouseId(row.original.id)}>
                  <Trash className="mr-2 h-4 w-4" />
                  Supprimer
                </Button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  if (loading) return <div>Chargement...</div>;

  return (
    <>
      <div className="flex items-center justify-between w-full mb-4">
        <DashboardHeading title="Entrepôts" description="Liste des entrepôts associés à l'organisation." />
        <Link href={`/organisation/${params.organisationId}/entrepots/nouveau`}>
          <Button variant="primary">
            <Plus /> Ajouter un entrepôt
          </Button>
        </Link>
      </div>
      <Table columns={columns} data={data} />
      <AlertDialog open={!!selectedWarehouseId} onOpenChange={() => setSelectedWarehouseId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cet entrepôt ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Page;
