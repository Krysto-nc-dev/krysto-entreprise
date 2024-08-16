import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ColumnDef,
  flexRender,
  useReactTable,
  PaginationState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table';
import { Sheet, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import * as XLSX from 'xlsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';

type Data = {
  id: number;
  name: string;
  price: number;
  category: string;
  description: string;
};

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filterValue: string;
  actionButtonText?: React.ReactNode;
  modalChildren?: React.ReactNode;
}

const DownloadExcelButton: React.FC<{ data: Data[] }> = ({ data }) => {
  const handleDownload = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    XLSX.writeFile(workbook, 'data.xlsx');
  };

  return (
    <Button
      size="sm"
      className="flex gap-2 bg-green-500 py-2 text-white"
      onClick={handleDownload}
    >
      <Sheet className="h-4 w-4" />
      Télécharger le fichier Excel
    </Button>
  );
};

const ActionsCell: React.FC<{ row: any }> = ({ row }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => alert(`Détails de ${row.original.name}`)}>
          Détails
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => alert(`Supprimer ${row.original.name}`)}>
          Supprimer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default function DataTable<TData, TValue>({
  columns,
  data,
  filterValue,
  actionButtonText,
  modalChildren,
}: DataTableProps<TData, TValue>) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10, // Afficher 10 produits par page
  });

  const [filterBy, setFilterBy] = useState('name'); // 'name', 'price', 'category', etc.
  const [globalFilter, setGlobalFilter] = useState<string>('');

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const value = item[filterBy] ?? ''; // Utilisation de la chaîne vide comme valeur par défaut
      return value.toString().toLowerCase().includes(globalFilter.toLowerCase());
    });
  }, [data, filterBy, globalFilter]);

  const totalRowCount = filteredData.length;

  const table = useReactTable({
    data: filteredData,
    columns,
    pageCount: Math.ceil(totalRowCount / pagination.pageSize),
    state: { pagination },
    onPaginationChange: setPagination,
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center py-2 gap-2">
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="bg-white border border-gray-300 rounded px-2 py-1 text-sm"
          >
            <option value="name">Nom</option>
            <option value="price">Prix</option>
            <option value="category">Catégorie</option>
          </select>
          <Input
            placeholder={`Rechercher par ${filterBy}...`}
            value={globalFilter}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="h-8 px-2 border border-gray-300 rounded text-sm"
          />
        </div>
        <DownloadExcelButton data={filteredData} />
      </div>
      <div className="border bg-background rounded-lg">
        <Table className="text-sm">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="p-2">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className="text-sm"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="p-2">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-12 text-center text-sm">
                  Aucun résultat.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between py-2">
        <Button
          variant="outline"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          {'<<'}
        </Button>
        <Button
          variant="outline"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          {'<'}
        </Button>
        <span className="text-sm">
          Page{' '}
          <strong>
            {pagination.pageIndex + 1} sur {table.getPageCount()}
          </strong>
        </span>
        <Button
          variant="outline"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          {'>'}
        </Button>
        <Button
          variant="outline"
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          {'>>'}
        </Button>
      </div>
    </>
  );
}
