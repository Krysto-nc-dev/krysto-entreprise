'use client'
import { Badge } from '@/components/ui/badge'
import { FunnelsForSubAccount } from '@/lib/types'
import { ColumnDef } from '@tanstack/react-table'
import { ExternalLink } from 'lucide-react'
import Link from 'next/link'

export const columns: ColumnDef<FunnelsForSubAccount>[] = [
  {
    accessorKey: 'name',
    header: 'Nom',
    cell: ({ row }) => {
      return (
        <Link
          className="flex gap-2 items-center"
          href={`/sous-compte/${row.original.subAccountId}/funnels/${row.original.id}`}
        >
          {row.getValue('name')}
          <ExternalLink size={15} />
        </Link>
      )
    },
  },
  {
    accessorKey: 'updatedAt',
    header: 'Dernière mise à jour',
    cell: ({ row }) => {
      const date = ` ${row.original.updatedAt.toDateString()} ${row.original.updatedAt.toLocaleTimeString()} `
      return <span className="text-muted-foreground">{date}</span>
    },
  },
  {
    accessorKey: 'published',
    header: 'Statut',
    cell: ({ row }) => {
      const status = row.original.published
      return status ? (
        <Badge variant={'default'}>En ligne - {row.original.subDomainName}</Badge>
      ) : (
        <Badge variant={'secondary'}>Brouillon</Badge>
      )
    },
  },
]
