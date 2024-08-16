'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { v4 as uuidv4 } from 'uuid'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useRouter } from 'next/navigation'

import { Input } from '@/components/ui/input'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'

import FileUpload from '@/components/global/fileupload'
import { Organisation, SubAccount } from '@prisma/client'
import { useToast } from '@/components/ui/use-toast'
import {
  upsertSubAccount,
  saveActivityLogsNotification,
  getSubaccountDetails,
  toggleSidebarOptionActive
} from '@/lib/queries'
import { useEffect, useState } from 'react'
import Loading from '@/components/global/loading'
import { useModal } from '@/providers/modal-provider'

const formSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  companyEmail: z.string().email('Email invalide'),
  companyPhone: z.string().min(1, 'Le numéro de téléphone est requis'),
  address: z.string().min(1, 'L\'adresse est requise'),
  city: z.string().min(1, 'La ville est requise'),
  subAccountLogo: z.string().optional(),
  zipCode: z.string().min(1, 'Le code postal est requis'),
  state: z.string().min(1, 'L\'état est requis'),
  country: z.string().min(1, 'Le pays est requis'),
})

interface SubAccountDetailsProps {
  organisationDetails: Organisation
  details?: Partial<SubAccount>
  userId: string
  userName: string
}

const SubAccountDetails: React.FC<SubAccountDetailsProps> = ({
  details,
  organisationDetails,
  userId,
  userName,
}) => {
  const { toast } = useToast()
  const { setClose } = useModal()
  const router = useRouter()
  const [sidebarOptions, setSidebarOptions] = useState<
    { id: string; name: string; active: boolean }[]
  >([])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: details?.name || '',
      companyEmail: details?.companyEmail || '',
      companyPhone: details?.companyPhone || '',
      address: details?.address || '',
      city: details?.city || '',
      zipCode: details?.zipCode || '',
      state: details?.state || '',
      country: details?.country || '',
      subAccountLogo: details?.subAccountLogo || '',
    },
  })

  useEffect(() => {
    if (details?.id) {  // Assurez-vous que details.id est défini
      form.reset(details)
      const fetchSidebarOptions = async () => {
        try {
          const subaccountDetails = await getSubaccountDetails(details.id)
          console.log('Subaccount Details:', subaccountDetails)

          if (subaccountDetails?.SidebarOption?.length > 0) {
            const options = subaccountDetails.SidebarOption.map(option => ({
              id: option.id,
              name: option.name,
              active: option.active || false,
            }))
            console.log('Options fetched:', options)
            setSidebarOptions(options)
          } else {
            console.warn('No SidebarOption found for subaccount:', details.id)
            setSidebarOptions([])  // Clear options if none found
          }
        } catch (error) {
          console.error('Error fetching sidebar options:', error)
          toast({
            variant: 'destructive',
            title: 'Erreur',
            description: 'Impossible de récupérer les options de la barre latérale.',
          })
        }
      }

      fetchSidebarOptions()
    }
  }, [details, form, toast])

  const handleToggle = async (sidebarOptionId: string, isActive: boolean) => {
    try {
      await toggleSidebarOptionActive(details?.id as string, sidebarOptionId, isActive)
      setSidebarOptions((prevOptions) =>
        prevOptions.map((option) =>
          option.id === sidebarOptionId ? { ...option, active: isActive } : option
        )
      )
    } catch (error) {
      console.error('Error toggling sidebar option:', error)
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de mettre à jour l\'option de la barre latérale.',
      })
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const subaccountId = details?.id ? details.id : uuidv4()

      const response = await upsertSubAccount({
        id: subaccountId,
        address: values.address,
        subAccountLogo: values.subAccountLogo,
        city: values.city,
        companyPhone: values.companyPhone,
        country: values.country,
        name: values.name,
        state: values.state,
        zipCode: values.zipCode,
        createdAt: new Date(),
        updatedAt: new Date(),
        companyEmail: values.companyEmail,
        organisationId: organisationDetails.id,
        connectAccountId: '',
        goal: 5000,
      })

      await saveActivityLogsNotification({
        organisationId: organisationDetails.id,
        description: `Nouveau sous-compte créé : ${values.name} par ${userName}`,
        subAccountId: subaccountId,
      })

      if (!response) throw new Error('Pas de réponse du serveur')

      toast({
        title: 'Détails du sous-compte enregistrés',
        description: 'Vos détails de sous-compte ont été enregistrés avec succès.',
      })

      setClose()
      router.refresh()
    } catch (error) {
      console.error('Error saving subaccount details:', error)
      toast({
        variant: 'destructive',
        title: 'Oups!',
        description: 'Impossible d\'enregistrer les détails du sous-compte.',
      })
    }
  }

  const isLoading = form.formState.isSubmitting

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Informations du sous-compte</CardTitle>
        <CardDescription>Veuillez entrer les détails de l'entreprise</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              disabled={isLoading}
              control={form.control}
              name="subAccountLogo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo du compte</FormLabel>
                  <FormControl>
                    <FileUpload
                      apiEndpoint="subaccountLogo"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex flex-col md:flex-row gap-4">
              <FormField
                disabled={isLoading}
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Nom du compte</FormLabel>
                    <FormControl>
                      <Input required placeholder="Nom de l'organisation" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                disabled={isLoading}
                control={form.control}
                name="companyEmail"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Email du compte</FormLabel>
                    <FormControl>
                      <Input placeholder="Email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <FormField
                disabled={isLoading}
                control={form.control}
                name="companyPhone"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Numéro de téléphone du compte</FormLabel>
                    <FormControl>
                      <Input required placeholder="Téléphone" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              disabled={isLoading}
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Adresse</FormLabel>
                  <FormControl>
                    <Input required placeholder="123 rue..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex flex-col md:flex-row gap-4">
              <FormField
                disabled={isLoading}
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Ville</FormLabel>
                    <FormControl>
                      <Input required placeholder="Ville" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                disabled={isLoading}
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>État</FormLabel>
                    <FormControl>
                      <Input required placeholder="État" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                disabled={isLoading}
                control={form.control}
                name="zipCode"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Code postal</FormLabel>
                    <FormControl>
                      <Input required placeholder="Code postal" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              disabled={isLoading}
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Pays</FormLabel>
                  <FormControl>
                    <Input required placeholder="Pays" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loading /> : 'Enregistrer les informations du compte'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export default SubAccountDetails
