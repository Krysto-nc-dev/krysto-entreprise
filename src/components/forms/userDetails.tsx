'use client'

import {
  AuthUserWithOrganisationSigebarOptionsSubAccounts,
  UserWithPermissionsAndSubAccounts,
} from '@/lib/types'
import { useModal } from '@/providers/modal-provider'
import { SubAccount, User } from '@prisma/client'
import React, { useEffect, useState } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'
import {
  changeUserPermissions,
  getAuthUserDetails,
  getUserPermissions,
  saveActivityLogsNotification,
  updateUser,
} from '@/lib/queries'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from '@/components/ui/form'
import FileUpload from '@/components/global/fileUpload'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectGroup,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectLabel,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import Loading from '@/components/global/loading'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { v4 } from 'uuid'

type Props = {
  id: string | null
  type: 'organisation' | 'subaccount'
  userData?: Partial<User>
  subAccounts?: SubAccount[]
}

const UserDetails = ({ id, type, subAccounts, userData }: Props) => {
  const [subAccountPermissions, setSubAccountsPermissions] =
    useState<UserWithPermissionsAndSubAccounts | null>(null)
  const [authUserData, setAuthUserData] =
    useState<AuthUserWithOrganisationSigebarOptionsSubAccounts | null>(null)
  const { data, setClose } = useModal()
  const [roleState, setRoleState] = useState('')
  const [loadingPermissions, setLoadingPermissions] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const fetchDetails = async () => {
      if (data?.user) {
        try {
          const response = await getAuthUserDetails()
          if (response) {
            console.log('Auth User Data:', response)
            setAuthUserData(response)
          } else {
            console.error('Aucune donnée utilisateur récupérée.')
          }
        } catch (error) {
          console.error('Erreur lors de la récupération des détails de l\'utilisateur authentifié:', error)
        }
      }
    }
    fetchDetails()
  }, [data])

  const userDataSchema = z.object({
    name: z.string().min(1, 'Le nom est requis'),
    email: z.string().email('Email invalide'),
    avatarUrl: z.string(),
    role: z.enum([
      'ORGANISATION_OWNER',
      'ORGANISATION_ADMIN',
      'SUBACCOUNT_USER',
      'SUBACCOUNT_GUEST',
    ]),
  })

  const form = useForm<z.infer<typeof userDataSchema>>({
    resolver: zodResolver(userDataSchema),
    mode: 'onChange',
    defaultValues: {
      name: userData ? userData.name : data?.user?.name,
      email: userData ? userData.email : data?.user?.email,
      avatarUrl: userData ? userData.avatarUrl : data?.user?.avatarUrl,
      role: userData ? userData.role : data?.user?.role,
    },
  })

  useEffect(() => {
    const getPermissions = async () => {
      if (!data?.user) return
      try {
        const permission = await getUserPermissions(data?.user.id)
        console.log('User Permissions:', permission)
        setSubAccountsPermissions(permission)
      } catch (error) {
        console.error('Erreur lors de la récupération des permissions utilisateur:', error)
      }
    }
    getPermissions()
  }, [data])

  useEffect(() => {
    if (data?.user) {
      form.reset(data.user)
    }
    if (userData) {
      form.reset(userData)
    }
  }, [userData, data, form])

  const onChangePermission = async (
    subAccountId: string,
    val: boolean,
    permissionsId: string | undefined
  ) => {
    if (!data?.user?.email) return
    setLoadingPermissions(true)
    try {
      const response = await changeUserPermissions(
        permissionsId ? permissionsId : v4(),
        data.user.email,
        subAccountId,
        val
      )
      if (type === 'organisation') {
        await saveActivityLogsNotification({
          organisationId: authUserData?.Organisation?.id,
          description: `Accès accordé à ${userData?.name} pour | ${
            subAccountPermissions?.Permissions.find(
              (p) => p.subAccountId === subAccountId
            )?.SubAccount.name
          } `,
          subaccountId: subAccountPermissions?.Permissions.find(
            (p) => p.subAccountId === subAccountId
          )?.SubAccount.id,
        })
      }

      if (response) {
        toast({
          title: 'Succès',
          description: 'La demande a été réalisée avec succès',
        })
        router.refresh()
      } else {
        throw new Error('Erreur lors de la mise à jour des permissions')
      }
    } catch (error) {
      console.error('Erreur lors du changement de permission:', error)
      toast({
        variant: 'destructive',
        title: 'Échec',
        description: 'Impossible de mettre à jour les permissions',
      })
    } finally {
      setLoadingPermissions(false)
    }
  }

  const onSubmit = async (values: z.infer<typeof userDataSchema>) => {
    if (!id) return
    try {
      const updatedUser = await updateUser(values)
      if (updatedUser) {
        toast({
          title: 'Succès',
          description: 'Informations de l\'utilisateur mises à jour',
        })
        setClose()
        router.refresh()
      } else {
        throw new Error('Erreur lors de la mise à jour des informations de l\'utilisateur')
      }
    } catch (error) {
      console.error('Erreur lors de la soumission des détails de l\'utilisateur:', error)
      toast({
        variant: 'destructive',
        title: 'Oops!',
        description: 'Impossible de mettre à jour les informations de l\'utilisateur',
      })
    }
  }

  console.log('SubAccounts:', subAccounts)
  console.log('AuthUserData:', authUserData)

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Détails de l'utilisateur</CardTitle>
        <CardDescription>Ajouter ou mettre à jour vos informations</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              disabled={form.formState.isSubmitting}
              control={form.control}
              name="avatarUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Photo de profil</FormLabel>
                  <FormControl>
                    <FileUpload
                      apiEndpoint="avatar"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              disabled={form.formState.isSubmitting}
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Nom complet</FormLabel>
                  <FormControl>
                    <Input
                      required
                      placeholder="Nom complet"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={form.formState.isSubmitting}
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      readOnly={
                        userData?.role === 'ORGANISATION_OWNER' ||
                        form.formState.isSubmitting
                      }
                      placeholder="Email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={form.formState.isSubmitting}
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Rôle de l'utilisateur</FormLabel>
                  <Select
                    disabled={field.value === 'ORGANISATION_OWNER'}
                    onValueChange={(value) => {
                      if (
                        value === 'SUBACCOUNT_USER' ||
                        value === 'SUBACCOUNT_GUEST'
                      ) {
                        setRoleState(
                          'Vous devez avoir des sous-comptes pour attribuer l\'accès aux sous-comptes aux membres de l\'équipe.'
                        )
                      } else {
                        setRoleState('')
                      }
                      field.onChange(value)
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner le rôle de l'utilisateur" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Rôles disponibles</SelectLabel>
                        <SelectItem value="ORGANISATION_ADMIN">
                          Administrateur de l'organisation
                        </SelectItem>
                        {(data?.user?.role === 'ORGANISATION_OWNER' ||
                          userData?.role === 'ORGANISATION_OWNER') && (
                          <SelectItem value="ORGANISATION_OWNER">
                            Propriétaire de l'organisation
                          </SelectItem>
                        )}
                        <SelectItem value="SUBACCOUNT_USER">
                          Utilisateur du sous-compte
                        </SelectItem>
                        <SelectItem value="SUBACCOUNT_GUEST">
                          Invité du sous-compte
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <p className="text-muted-foreground">{roleState}</p>
                </FormItem>
              )}
            />

            <Button
              disabled={form.formState.isSubmitting}
              type="submit"
            >
              {form.formState.isSubmitting ? <Loading /> : 'Enregistrer les détails de l\'utilisateur'}
            </Button>
     

  
              <div>
                <Separator className="my-4" />
                <FormLabel>Permissions de l'utilisateur</FormLabel>
                <FormDescription className="mb-4">
                  Vous pouvez accorder l'accès aux sous-comptes aux membres de l'équipe en activant le contrôle d'accès pour chaque sous-compte. Cela est uniquement visible pour les propriétaires d'organisation.
                </FormDescription>
                <div className="flex flex-col gap-4">
                  {subAccounts?.map((subAccount) => {
                    const subAccountPermissionsDetails =
                      subAccountPermissions?.Permissions.find(
                        (p) => p.subAccountId === subAccount.id
                      )
                    return (
                      <div
                        key={subAccount.id}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div>
                          <p>{subAccount.name}</p>
                        </div>
                        <Switch
                          disabled={loadingPermissions}
                          checked={subAccountPermissionsDetails?.access}
                          onCheckedChange={(permission) => {
                            onChangePermission(
                              subAccount.id,
                              permission,
                              subAccountPermissionsDetails?.id
                            )
                          }}
                        />
                      </div>
                    )
                  })
                  
                  }
                </div>
              </div>
           
            

            {authUserData?.role === 'ORGANISATION_OWNER' && subAccounts?.length > 0 ? (
              <div>
                <Separator className="my-4" />
                <FormLabel>Permissions de l'utilisateur</FormLabel>
                <FormDescription className="mb-4">
                  Vous pouvez accorder l'accès aux sous-comptes aux membres de l'équipe en activant le contrôle d'accès pour chaque sous-compte. Cela est uniquement visible pour les propriétaires d'organisation.
                </FormDescription>
                <div className="flex flex-col gap-4">
                  {subAccounts?.map((subAccount) => {
                    const subAccountPermissionsDetails =
                      subAccountPermissions?.Permissions.find(
                        (p) => p.subAccountId === subAccount.id
                      )
                    return (
                      <div
                        key={subAccount.id}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div>
                          <p>{subAccount.name}</p>
                        </div>
                        <Switch
                          disabled={loadingPermissions}
                          checked={subAccountPermissionsDetails?.access}
                          onCheckedChange={(permission) => {
                            onChangePermission(
                              subAccount.id,
                              permission,
                              subAccountPermissionsDetails?.id
                            )
                          }}
                        />
                      </div>
                    )
                  })
                  
                  }
                </div>
              </div>
            ) : (
              <p className="text-red-500 text-center text-sm">Pas de sous-comptes disponibles ou vous n'avez pas les droits requis pour modifier les permissions.</p>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export default UserDetails
