import BlurPage from '@/components/global/blurPage';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { db } from '@/lib/db';

import { CheckCircleIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

type Props = {
    searchParams: {
        state: string;
        code: string;
    };
    params: { subaccountId: string };
}

const Page = async ({ params, searchParams }: Props) => {
    const subaccountDetails = await db.subAccount.findUnique({
        where: {
            id: params.subaccountId,
        },
    });

    if (!subaccountDetails) {
        return null;
    }

    const allDetailsExist =
        subaccountDetails.address &&
        subaccountDetails.subAccountLogo &&
        subaccountDetails.companyEmail &&
        subaccountDetails.companyPhone &&
        subaccountDetails.country &&
        subaccountDetails.name &&
        subaccountDetails.state &&
        subaccountDetails.zipCode;

    if (!allDetailsExist) {
        return <div>Les détails du sous-compte sont incomplets.</div>;
    }

    return (
        <BlurPage>
            <div className="flex flex-col justify-center items-center">
                <div className="w-full h-full max-w-[800px]">
                    <Card className="border-none">
                        <CardHeader>
                            <CardTitle>Commençons !</CardTitle>
                            <CardDescription>
                                Suivez les étapes ci-dessous pour configurer correctement votre compte.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            <div className="flex justify-between items-center w-full h-20 border p-4 rounded-lg">
                                <div className="flex items-center gap-4">
                                    <Image
                                        src="/appstore.png"
                                        alt="Logo de l'application"
                                        height={80}
                                        width={80}
                                        className="rounded-md object-contain"
                                    />
                                    <p>Enregistrez le site Web comme raccourci sur votre appareil mobile.</p>
                                </div>
                                <Button>Commencer</Button>
                            </div>
                            <div className="flex justify-between items-center w-full h-20 border p-4 rounded-lg">
                                <div className="flex items-center gap-4">
                                    <Image
                                        src="/stripelogo.png"
                                        alt="Logo de l'application"
                                        height={80}
                                        width={80}
                                        className="rounded-md object-contain"
                                    />
                                    <p>
                                        Connectez votre compte Stripe pour accepter les paiements. Stripe est utilisé pour effectuer les paiements.
                                    </p>
                                </div>
                                {/* {subaccountDetails.connectAccountId ||
                                connectedStripeAccount ? (
                                  <CheckCircleIcon
                                    size={50}
                                    className=" text-primary p-2 flex-shrink-0"
                                  />
                                ) : (
                                  <Link
                                    className="bg-primary py-2 px-4 rounded-md text-white"
                                    href={stripeOAuthLink}
                                  >
                                    Commencer
                                  </Link>
                                )} */}
                            </div>
                            <div className="flex justify-between items-center w-full h-20 border p-4 rounded-lg">
                                <div className="flex items-center gap-4">
                                    <Image
                                        src={subaccountDetails.subAccountLogo}
                                        alt="Logo du sous-compte"
                                        height={80}
                                        width={80}
                                        className="rounded-md object-contain p-4"
                                    />
                                    <p>Remplissez tous les détails du sous-compte.</p>
                                </div>
                                {allDetailsExist ? (
                                    <CheckCircleIcon
                                        size={50}
                                        className=" text-primary p-2 flex-shrink-0"
                                    />
                                ) : (
                                    <Link
                                        className="bg-primary py-2 px-4 rounded-md text-white"
                                        href={`/subaccount/${subaccountDetails.id}/settings`}
                                    >
                                        Commencer
                                    </Link>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </BlurPage>
    );
};

export default Page;
