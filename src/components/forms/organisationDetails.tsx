'use client'

import { useForm } from 'react-hook-form';
import { Organisation } from '@prisma/client';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

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
} from '@/components/ui/alert-dialog';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { NumberInput } from '@tremor/react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import * as z from 'zod';
import FileUpload from '@/components/global/fileupload';
import { Input } from '@/components/ui/input';
import {
  updateOrganisationDetails,
  saveActivityLogsNotification,
  upsertOrganisation,
  initUser,
} from '@/lib/queries';
import { v4 } from 'uuid';
import Loading from '@/components/global/loading';

type Props = {
  data?: Partial<Organisation>;
};

const FormSchema = z.object({
  name: z.string().min(2, {
    message: "Le nom de l'entreprise doit contenir au moins 2 caractères",
  }),
  companyEmail: z.string().email({ message: 'Veuillez entrer une adresse email valide' }),
  companyPhone: z.string().min(2, {
    message: "Le numéro de téléphone de l'entreprise doit contenir au moins 2 caractères",
  }),
  whiteLabel: z.boolean(),
  tgcAssujeti: z.boolean(),
  address: z.string().min(2, {
    message: "L'adresse de l'entreprise doit contenir au moins 2 caractères",
  }),
  city: z.string().min(2, {
    message: "La ville de l'entreprise doit contenir au moins 2 caractères",
  }),
  zipCode: z.string().min(2, {
    message: "Le code postal de l'entreprise doit contenir au moins 2 caractères",
  }),
  province: z.string().min(2, {
    message: "La province de l'entreprise doit contenir au moins 2 caractères",
  }),
  country: z.string().min(2, {
    message: "Le pays de l'entreprise doit contenir au moins 2 caractères",
  }),
  organisationType: z.string().min(1, {
    message: "Le type d'organisation doit être sélectionné",
  }),
  ridet: z.string().min(2, { message: 'Le RIDET doit contenir au moins 2 caractères' }),
  fiscalYearStart: z.string().min(2, {
    message: "La date de début de l'année fiscale doit contenir au moins 2 caractères",
  }),
  fiscalYearEnd: z.string().min(2, {
    message: "La date de fin de l'année fiscale doit contenir au moins 2 caractères",
  }),
  bp: z.string().min(2, {
    message: 'La boite postale doit contenir au moins 2 caractères',
  }),
  organisationLogo: z.string().min(1, { message: "Le logo de l'entreprise doit être fourni" }),
  legalRepresentative: z.string().optional(),
  businessType: z.string().optional(),
  website: z.string().optional(),
  companyDescription: z.string().optional(),
  numberOfEmployees: z.preprocess((val) => Number(val), z.number().optional()),
  foundingDate: z.string().optional(),
  tgcNumber: z.string().optional(), // Numéro TGC
  isActive: z.boolean().optional(), // Statut d'activité
});

const OrganisationDetails = ({ data }: Props) => {
  const { toast } = useToast();
  const router = useRouter();

  const [deletingOrganisation, setDeletingOrganisation] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    mode: 'onChange',
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: data?.name,
      companyEmail: data?.companyEmail,
      companyPhone: data?.companyPhone,
      whiteLabel: data?.whiteLabel || false,
      tgcAssujeti: data?.tgcAssujeti || false,
      address: data?.address,
      city: data?.city,
      zipCode: data?.zipCode,
      province: data?.province || 'SUD',
      country: 'Nouvelle-Calédonie',
      organisationType: data?.organisationType,
      ridet: data?.ridet,
      fiscalYearStart: data?.fiscalYearStart,
      fiscalYearEnd: data?.fiscalYearEnd,
      bp: data?.bp,
      organisationLogo: data?.organisationLogo,
      legalRepresentative: data?.legalRepresentative,
      businessType: data?.businessType,
      website: data?.website,
      companyDescription: data?.companyDescription,
      numberOfEmployees: data?.numberOfEmployees || undefined,
      foundingDate: data?.foundingDate ? new Date(data.foundingDate).toISOString().slice(0, 10) : '',
      tgcNumber: data?.tgcNumber,
      isActive: data?.isActive || true,
    },
  });

  const isLoading = form.formState.isSubmitting;
  useEffect(() => {
    if (data) form.reset(data);
  }, [data]);

  const handleSubmit = async (values: z.infer<typeof FormSchema>) => {
    console.log("Submitted values:", values);
    try {
      let newUserData;
      let organisation;
  
      if (!data?.id) {
        // Données pour la création dans Dolibarr
        const bodyData = {
          entity: '1',
          status: '1',
          country_id: '165',
          country_code: 'NC',
          multicurrency_code: 'XPF',
          name: values.name,
          name_alias: values.name,
          phone: values.companyPhone,
          email: values.companyEmail,
          idprof1: values.ridet,
          capital: null,
          tva_assuj: '0',
          address: values.address,
          zip: values.zipCode,
          town: values.city,
        };
  
        // Envoi des données à Dolibarr (décommentez pour utiliser)
        /*const customerResponse = await fetch(`${process.env.DOLIBARR_API_URL}/thirdparties`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'dolapikey': process.env.DOLAPIKEY
          },
          body: JSON.stringify(bodyData),
        });
        const customerData = await customerResponse.json();
        if (!customerResponse.ok) {
          throw new Error('Failed to create customer in Dolibarr');
        }*/
  
        newUserData = await initUser({ role: 'ORGANISATION_OWNER' });
  
        organisation = await upsertOrganisation({
          id: v4(),
          ...values,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
  
        toast({
          title: 'Entreprise créée avec succès',
        });
        router.refresh();
      } else {
        organisation = await upsertOrganisation({
          id: data.id,
          ...values,
          updatedAt: new Date(),
        });
  
        newUserData = await initUser({ role: 'ORGANISATION_OWNER' });
  
        // Mise à jour de l'organisation dans Dolibarr (décommentez pour utiliser)
        /*const updatedOrganisation = await registerOrganisationInDolibarr(organisation.id);
        if (!updatedOrganisation) {
          throw new Error('Failed to update organisation in Dolibarr');
        }*/
  
        toast({
          title: 'Entreprise mise à jour avec succès',
        });
        router.refresh();
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Oups!',
        description: 'Impossible de traiter votre demande',
      });
    }
  };
  

  const handleDeleteOrganisation = async () => {
    if (!data?.id) return;
    setDeletingOrganisation(true);

    try {
      const response = await deleteOrganisation(data.id);
      toast({
        title: 'Entreprise supprimée',
        description:
          'Votre Entreprise et tous les sous-comptes ont été supprimés',
      });
      router.refresh();
    } catch (error) {
      console.log(error);
      toast({
        variant: 'destructive',
        title: 'Oups!',
        description: 'Impossible de supprimer votre entreprise',
      });
    }
    setDeletingOrganisation(false);
  };

  return (
    <AlertDialog>
      <Card className="w-full mt-4">
        <CardHeader>
          <CardTitle>Informations sur votre entreprise</CardTitle>
          <CardDescription>
            Créeons maintenant votre entreprise pour pouvoir accéder aux fonctionnalités de Fllux
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="py-4">
              <FormField
                disabled={isLoading}
                control={form.control}
                name="organisationLogo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo de l'entreprise</FormLabel>
                    <FormControl>
                      <FileUpload
                        apiEndpoint="organisationLogo"
                        onChange={(value) => {
                          console.log('File uploaded:', value);
                          field.onChange(value);
                        }}
                        value={field.value}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="my-4">
                <h4 className="text-xl text-primary">Information générale</h4>
                <div className="flex md:flex-row gap-4">
                  <FormField
                    disabled={isLoading}
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Nom de l'entreprise</FormLabel>
                        <FormControl>
                          <Input placeholder="Nom de l'entreprise" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    disabled={isLoading}
                    control={form.control}
                    name="organisationType"
                    render={({ field }) => (
                      <FormItem className="w-[200px]">
                        <FormLabel>Type</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner le type d'entreprise" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Type d'entreprise</SelectLabel>
                                <SelectItem value="SARL">SARL</SelectItem>
                                <SelectItem value="ASSOCIATION">Association</SelectItem>
                                <SelectItem value="PATENTE">Patente</SelectItem>
                                <SelectItem value="ARTISAN">Artisan</SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div className="my-4">
                <h4 className="text-xl text-primary">Information de contact</h4>
                <div className="flex md:flex-row gap-4">
                  <FormField
                    disabled={isLoading}
                    control={form.control}
                    name="companyEmail"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Email de l'entreprise</FormLabel>
                        <FormControl>
                          <Input placeholder="email de l'entreprise" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    disabled={isLoading}
                    control={form.control}
                    name="companyPhone"
                    render={({ field }) => (
                      <FormItem className="w-[200px]">
                        <FormLabel>Téléphone</FormLabel>
                        <FormControl>
                          <Input placeholder="28.29.30" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div className="my-4">
                <h4 className="text-xl text-primary">Information géographique</h4>

                <FormField
                  disabled={isLoading}
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adresse</FormLabel>
                      <FormControl>
                        <Input placeholder="adresse de l'entreprise" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="flex md:flex-row gap-4 mt-3">
                  <FormField
                    disabled={isLoading}
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Ville</FormLabel>
                        <FormControl>
                          <Input placeholder="Ville de l'entreprise" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    disabled={isLoading}
                    control={form.control}
                    name="zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Code postal</FormLabel>
                        <FormControl>
                          <Input placeholder="98800" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    disabled={isLoading}
                    control={form.control}
                    name="province"
                    render={({ field }) => (
                      <FormItem className="w-[200px]">
                        <FormLabel>Province</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner la province de l'entreprise" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Provinces</SelectLabel>
                                <SelectItem value="SUD">Province Sud</SelectItem>
                                <SelectItem value="NORD">Province Nord</SelectItem>
                                <SelectItem value="ILES">Province des îles</SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div className="flex md:flex-row gap-4 mt-3">
                <FormField
                  disabled={isLoading}
                  control={form.control}
                  name="bp"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Boite postale</FormLabel>
                      <FormControl>
                        <Input placeholder="BP 5262" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  disabled={isLoading}
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem className="w-[200px]">
                      <FormLabel>Pays</FormLabel>
                      <FormControl>
                        <Input placeholder="Nouvelle-Calédonie" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <div className="my-4">
                <h4 className="text-xl text-primary mb-3">Autres informations</h4>

                <div className="flex md:flex-row gap-4">
                  <FormField
                    disabled={isLoading}
                    control={form.control}
                    name="ridet"
                    render={({ field }) => (
                      <FormItem className="w-[200px]">
                        <FormLabel>Ridet de l'entreprise</FormLabel>
                        <FormControl>
                          <Input placeholder="165432" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    disabled={isLoading}
                    control={form.control}
                    name="fiscalYearStart"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Début de l'exercice fiscal</FormLabel>
                        <FormControl>
                          <Input placeholder="01/06" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    disabled={isLoading}
                    control={form.control}
                    name="fiscalYearEnd"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Fin de l'exercice fiscal</FormLabel>
                        <FormControl>
                          <Input placeholder="31/05" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex md:flex-row gap-4 mt-3">
                  <FormField
                    disabled={isLoading}
                    control={form.control}
                    name="legalRepresentative"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Représentant légal</FormLabel>
                        <FormControl>
                          <Input placeholder="Nom du représentant légal" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    disabled={isLoading}
                    control={form.control}
                    name="businessType"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Type d'activité</FormLabel>
                        <FormControl>
                          <Input placeholder="Type d'activité de l'entreprise" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex md:flex-row gap-4 mt-3">
                  <FormField
                    disabled={isLoading}
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Site web</FormLabel>
                        <FormControl>
                          <Input placeholder="URL du site web de l'entreprise" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
<FormField
  control={form.control}
  name="numberOfEmployees"
  render={({ field, fieldState }) => (
    <FormItem>
      <FormLabel>Nombre d'employés</FormLabel>
      <FormControl>
        <Input
          type="number"
          value={field.value || ''}
          onChange={(e) => field.onChange(Number(e.target.value))}
          placeholder="Nombre d'employés"
        />
      </FormControl>
      {fieldState.error && (
        <p className="text-red-500">{fieldState.error.message}</p>
      )}
    </FormItem>
  )}
/>
                </div>
                <div className="flex md:flex-row gap-4 mt-3">
                  <FormField
                    disabled={isLoading}
                    control={form.control}
                    name="foundingDate"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Date de création</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    disabled={isLoading}
                    control={form.control}
                    name="tgcNumber"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Numéro TGC</FormLabel>
                        <FormControl>
                          <Input placeholder="Numéro TGC de l'entreprise" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  disabled={isLoading}
                  control={form.control}
                  name="companyDescription"
                  render={({ field }) => (
                    <FormItem className="mt-3">
                      <FormLabel>Description de l'entreprise</FormLabel>
                      <FormControl>
                        <Input placeholder="Brève description de l'entreprise" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  disabled={isLoading}
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="mt-3 flex flex-row items-center justify-between rounded-lg border gap-4 p-4">
                      <div>
                        <FormLabel>Statut d'activité</FormLabel>
                        <FormDescription>
                          L'entreprise est-elle active ?
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  disabled={isLoading}
                  control={form.control}
                  name="tgcAssujeti"
                  render={({ field }) => (
                    <FormItem className="mt-3 flex flex-row items-center justify-between rounded-lg border gap-4 p-4">
                      <div>
                        <FormLabel>Êtes-vous assujeti à la TGC ?</FormLabel>
                        <FormDescription>
                          Si vous êtes assujeti à la TGC, cochez cette option
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  disabled={isLoading}
                  control={form.control}
                  name="whiteLabel"
                  render={({ field }) => (
                    <FormItem className="mt-3 flex flex-row items-center justify-between rounded-lg border gap-4 p-4">
                      <div>
                        <FormLabel>Passer en marque blanche</FormLabel>
                        <FormDescription>
                          Placer votre entreprise en marque blanche montre votre logo à tous les sous-comptes par défaut. Vous pouvez changer cela dans les paramètres de sous-comptes.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {data?.id && (
                <div className="flex flex-col gap-2">
                  <FormLabel>Créer un objectif pour votre entreprise</FormLabel>
                  <FormDescription>
                    ✨ Créez un objectif pour votre entreprise. À mesure que votre entreprise se développe, vos objectifs augmentent également, alors n'oubliez pas de mettre la barre plus haut !
                  </FormDescription>
                  <NumberInput
                    defaultValue={data?.goal}
                    onValueChange={async (val) => {
                      if (!data?.id) return
                      await updateOrganisationDetails(data.id, { goal: val })
                      await saveActivityLogsNotification({
                        organisationId: data.id,
                        description: `Mise à jour de l'objectif de l'entreprise à ${val} sous-comptes`,
                        subaccountId: undefined,
                      })
                      router.refresh()
                    }}
                    min={1}
                    className="bg-background !border !border-input"
                    placeholder="Objectif de sous-comptes"
                  />
                </div>
              )}
              <Button
                className="w-full mt-6"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loading />
                ) : (
                  "Enregistrer les informations de l'entreprise"
                )}
              </Button>
            </form>
          </Form>

          {data?.id && (
            <div className="flex flex-row items-center justify-between flex-col rounded-lg border border-destructive gap-4 p-4 mt-4">
              <div>
                <div>Zone de danger</div>
              </div>
              <div className="text-muted-foreground text-center">
                Supprimer votre entreprise ne peut pas être annulé. Cela supprimera également tous les sous-comptes et toutes les données relatives à vos sous-comptes. Les sous-comptes n'auront plus accès aux entonnoirs, contacts, etc.
              </div>
              <AlertDialogTrigger
                disabled={isLoading || deletingOrganisation}
                className="text-red-600 p-2 text-center mt-2 rounded-md hover:bg-red-600 hover:text-white whitespace-nowrap"
              >
                {deletingOrganisation
                  ? 'Suppression...'
                  : "Supprimer l'entreprise"}
              </AlertDialogTrigger>
            </div>
          )}
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-left">
                Êtes-vous absolument sûr ?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-left">
                Cette action ne peut pas être annulée. Cela supprimera définitivement le compte de votre entreprise et tous les sous-comptes associés.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex items-center">
              <AlertDialogCancel className="mb-2">Annuler</AlertDialogCancel>
              <AlertDialogAction
                disabled={deletingOrganisation}
                className="bg-destructive hover:bg-destructive"
                onClick={handleDeleteOrganisation}
              >
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </CardContent>
      </Card>
    </AlertDialog>
  )
}

export default OrganisationDetails
