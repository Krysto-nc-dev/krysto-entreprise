
import BlurPage from '@/components/global/blurpage'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getFunnel } from '@/lib/queries'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import React from 'react'
import FunnelSettings from './_components/funnel-settings'
import FunnelSteps from './_components/funnel-steps'

type Props = {
  params: { funnelId: string; subaccountId: string }
}

const FunnelPage = async ({ params }: Props) => {
  const funnelPages = await getFunnel(params.funnelId)
  if (!funnelPages)
    return redirect(`/sous-compte/${params.subaccountId}/funnels`)

  return (
    <BlurPage>
      <Link
        href={`/sous-compte/${params.subaccountId}/funnels`}
        className="flex justify-between gap-4 mb-4 text-muted-foreground"
      >
        Retour
      </Link>
      <h1 className="text-3xl mb-8">{funnelPages.name}</h1>
      <Tabs
        defaultValue="steps"
        className="w-full"
      >
        <TabsList className="grid  grid-cols-2 w-[50%] bg-transparent ">
          <TabsTrigger value="steps">Etapes</TabsTrigger>
          <TabsTrigger value="settings">Paramétres</TabsTrigger>
        </TabsList>
        <TabsContent value="steps">
          <FunnelSteps
            funnel={funnelPages}
            subaccountId={params.subaccountId}
            pages={funnelPages.FunnelPages}
            funnelId={params.funnelId}
          />
        </TabsContent>
        <TabsContent value="settings">
          <FunnelSettings
            subaccountId={params.subaccountId}
            defaultData={funnelPages}
          />
        </TabsContent>
      </Tabs>
    </BlurPage>
  )
}

export default FunnelPage
