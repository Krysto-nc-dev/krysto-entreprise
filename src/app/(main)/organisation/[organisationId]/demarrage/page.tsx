import OrganisationDetails from '@/components/forms/organisationdetails';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { db } from '@/lib/db';
import { CheckCircle, CheckCircleIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

type Props = {
  params: {
    organisationId: string;
  };
  searchParams: { code: string }
};

const LaunchPadPage = async ({ params, searchParams }: Props) => {

  const organisationDetails = await db.organisation.findUnique({
    where: {
      id: params.organisationId
    }
  })

  console.log(organisationDetails)

  if (!organisationDetails) return
  const allDetailsExist =
    organisationDetails.address &&
    organisationDetails.organisationLogo &&
    organisationDetails.city &&
    organisationDetails.companyEmail &&
    organisationDetails.companyPhone &&
    organisationDetails.country &&
    organisationDetails.name &&
    organisationDetails.province &&
    organisationDetails.zipCode

  return (
    <div className='flex flex-col justify-center items-center'>
      <div className='w-full h-full max-w-[800px]'>
        <Card className='border-none'>
          <CardHeader>
            <CardTitle>C'est parti !</CardTitle>
            <CardDescription>
              Suivez les étapes ci-dessous pour configurer votre compte
            </CardDescription>
          </CardHeader>
          <CardContent className='flex flex-col gap-4'>
            <div className='flex justify-between items-center w-full border p-4 rounded-lg gap-2'>
              <div className='flex md:items-center gap-4 flex-col md:!flex-row'>
                <Image
                  src='/appstore.png'
                  alt='app logo'
                  height={80}
                  width={80}
                  className='rounded-md object-contain'
                />
                <p>Créer un accès direct à un site web sur votre smartphone</p>
              </div>
              <Button>Commencer</Button>
            </div>
            <div className='flex justify-between items-center w-full border p-4 rounded-lg gap-2'>
              <div className='flex md:items-center gap-4 flex-col md:!flex-row'>
                <Image
                  src="/stripelogo.png"
                  alt='stripe logo'
                  height={80}
                  width={80}
                  className='rounded-md object-contain'
                />
                <p>
                  Connecter votre compte Stripe pour accepter les paiments en ligne. et voir votre dashboard.
                </p>
              </div>
              <Button>Commencer</Button>
              {/* {allDetailsExist ? <CheckCircle className="text-primary p-2 flex-shrink-0" size={50} /> : <Link className="bg-primary py-2 px-4 rounded-md flex-shrink-0" href={`/organisation/${params.organisationId}/parametres`}>Commencer</Link>} */}
            </div>
            <div className='flex justify-between items-center w-full border p-4 rounded-lg gap-2'>
              <div className='flex md:items-center gap-4 flex-col md:!flex-row'>
                <Image
                  src={organisationDetails.organisationLogo}
                  alt='organisation logo'
                  height={80}
                  width={80}
                  className='rounded-md object-contain'
                />
                <p>
                  Remplissez tous les détails de votre entreprise
                </p>
              </div>
              {allDetailsExist ? <CheckCircle className="text-primary p-2 flex-shrink-0" size={50} /> : <Link className="bg-primary py-2 px-4 rounded-md flex-shrink-0" href={`/organisation/${params.organisationId}/parametres`}>Commencer</Link>}
            </div>
            
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LaunchPadPage;
