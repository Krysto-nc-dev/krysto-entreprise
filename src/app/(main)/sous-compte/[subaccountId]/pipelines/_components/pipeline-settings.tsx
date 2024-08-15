'use client'
import React from 'react'
import PipelineInfobar from './pipeline-infobar'
import { Pipeline } from '@prisma/client'
import CreatePipelineForm from '@/components/forms/create-pipeline-form'
import { Button } from '@/components/ui/button'
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
import { deletePipeline } from '@/lib/queries'
import { toast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'

const PipelineSettings = ({
  pipelineId,
  subaccountId,
  pipelines,
}: {
  pipelineId: string
  subaccountId: string
  pipelines: Pipeline[]
}) => {
  const router = useRouter()
  return (
    <AlertDialog>
      <div>
        <div className="flex items-center justify-between mb-4">
          <AlertDialogTrigger asChild>
            <Button variant={'destructive'}>Supprimer le Kanban</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action est irréversible. Cela supprimera définitivement votre compte et retirera vos données de nos serveurs.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="items-center">
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  try {
                    await deletePipeline(pipelineId)
                    //Journal d'activité : Action de suppression
                    toast({
                      title: 'Supprimé',
                      description: 'Le Kanban a été supprimé',
                    })
                    router.replace(`/sous-compte/${subaccountId}/pipelines`)
                  } catch (error) {
                    toast({
                      variant: 'destructive',
                      title: 'Oups !',
                      description: 'Impossible de supprimer le Kanban',
                    })
                  }
                }}
              >
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </div>

        <CreatePipelineForm
          subAccountId={subaccountId}
          defaultData={pipelines.find((p) => p.id === pipelineId)}
        />
      </div>
    </AlertDialog>
  )
}

export default PipelineSettings
