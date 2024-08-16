'use client'

import clsx from 'clsx'
import { ColumnDef } from '@tanstack/react-table'
import {
  Organisation,
  OrganisationSidebarOption,
  Permissions,
  Prisma,
  Role,
  SubAccount,
  User,
} from '@prisma/client'
import Image from 'next/image'

import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Copy, Edit, MoreHorizontal, Trash } from 'lucide-react'
import { useModal } from '@/providers/modal-provider'
import UserDetails from '@/components/forms/userDetails'

import { deleteUser, getUser } from '@/lib/queries'
import { useToast } from '@/components/ui/use-toast'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UsersWithOrganisationSubAccountPermissionsSidebarOptions } from '@/lib/types'
import CustomModal from '@/components/global/custommodal'

export const columns: ColumnDef<UsersWithOrganisationSubAccountPermissionsSidebarOptions>[] =
  [
    {
      accessorKey: 'id',
      header: '',
      cell: () => {
        return null
      },
    },
    {
      accessorKey: 'name',
      header: 'Nom',
      cell: ({ row }) => {
        const avatarUrl = row.getValue('avatarUrl') as string
        return (
          <div className="flex items-center gap-4">
            <div className="h-11 w-11 relative flex-none">
              <Image
                src={avatarUrl}
                fill
                className="rounded-full object-cover"
                alt="image de l'avatar"
              />
            </div>
            <span>{row.getValue('name')}</span>
          </div>
        )
      },
    },
    {
      accessorKey: 'avatarUrl',
      header: '',
      cell: () => {
        return null
      },
    },
    { accessorKey: 'email', header: 'Email' },

    {
      accessorKey: 'SubAccount',
      header: 'Comptes Possédés',
      cell: ({ row }) => {
        const isOrganisationOwner = row.getValue('role') === 'ORGANISATION_OWNER'
        const ownedAccounts = row.original?.Permissions.filter(
          (per) => per.access
        )

        if (isOrganisationOwner)
          return (
            <div className="flex flex-col items-start">
              <div className="flex flex-col gap-2">
                <Badge className="bg-slate-600 whitespace-nowrap">
                  Organisation - {row?.original?.Organisation?.name}
                </Badge>
              </div>
            </div>
          )
        return (
          <div className="flex flex-col items-start">
            <div className="flex flex-col gap-2">
              {ownedAccounts?.length ? (
                ownedAccounts.map((account) => (
                  <Badge
                    key={account.id}
                    className="bg-slate-600 w-fit whitespace-nowrap"
                  >
                    Sous-compte - {account.SubAccount.name}
                  </Badge>
                ))
              ) : (
                <div className="text-muted-foreground">Aucun accès pour le moment</div>
              )}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'role',
      header: 'Rôle',
      cell: ({ row }) => {
        const role: Role = row.getValue('role')
        return (
          <Badge
            className={clsx({
              'bg-emerald-500': role === 'ORGANISATION_OWNER',
              'bg-orange-400': role === 'ORGANISATION_ADMIN',
              'bg-primary': role === 'SUBACCOUNT_USER',
              'bg-muted': role === 'SUBACCOUNT_GUEST',
            })}
          >
            {role}
          </Badge>
        )
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const rowData = row.original

        return <CellActions rowData={rowData} />
      },
    },
  ]

interface CellActionsProps {
  rowData: UsersWithOrganisationSubAccountPermissionsSidebarOptions
}

const CellActions: React.FC<CellActionsProps> = ({ rowData }) => {
  const { data, setOpen } = useModal()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  if (!rowData) return
  if (!rowData.Organisation) return

  return (
    <AlertDialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0"
          >
            <span className="sr-only">Ouvrir le menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            className="flex gap-2"
            onClick={() => navigator.clipboard.writeText(rowData?.email)}
          >
            <Copy size={15} /> Copier l'email
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="flex gap-2"
            onClick={() => {
              setOpen(
                <CustomModal
                  subheading="Vous pouvez modifier les permissions uniquement lorsque l'utilisateur possède un sous-compte."
                  title="Modifier les détails de l'utilisateur"
                >
                  <UserDetails
                    type="organisation"
                    id={rowData?.Organisation?.id || null}
                    subAccounts={rowData?.Organisation?.SubAccount}
                  />
                </CustomModal>,
                async () => {
                  return { user: await getUser(rowData?.id) }
                }
              )
            }}
          >
            <Edit size={15} />
            Modifier les détails
          </DropdownMenuItem>
          {rowData.role !== 'ORGANISATION_OWNER' && (
            <AlertDialogTrigger asChild>
              <DropdownMenuItem
                className="flex gap-2"
                onClick={() => {}}
              >
                <Trash size={15} /> Supprimer l'utilisateur
              </DropdownMenuItem>
            </AlertDialogTrigger>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-left">
            Êtes-vous absolument sûr ?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left">
            Cette action ne peut pas être annulée. Cela supprimera définitivement l'utilisateur et les données associées.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex items-center">
          <AlertDialogCancel className="mb-2">Annuler</AlertDialogCancel>
          <AlertDialogAction
            disabled={loading}
            className="bg-destructive hover:bg-destructive"
            onClick={async () => {
              setLoading(true)
              await deleteUser(rowData.id)
              toast({
                title: 'Utilisateur supprimé',
                description:
                  "L'utilisateur a été supprimé de cette organisation et n'a plus accès à celle-ci.",
              })
              setLoading(false)
              router.refresh()
            }}
          >
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
