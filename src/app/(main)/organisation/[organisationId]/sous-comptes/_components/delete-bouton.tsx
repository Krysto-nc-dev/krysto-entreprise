'use client'

import {
  deleteSubAccount,
  getSubaccountDetails,
  saveActivityLogsNotification,
} from '@/lib/queries'
import { TrashIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React from 'react'

type Props = {
  subaccountId: string
}

const DeleteButton = ({ subaccountId }: Props) => {
  const router = useRouter()

  const handleDelete = async () => {
    try {
      const response = await getSubaccountDetails(subaccountId)
      
      if (!response) {
        console.error('Subaccount details not found')
        return
      }

      // Assurez-vous que l'ID de l'organisation est bien récupéré depuis la réponse
      const organisationId = response.organisationId

      if (!organisationId) {
        console.error('Organisation ID not found')
        return
      }

      // Enregistrement du journal d'activité
      await saveActivityLogsNotification({
        organisationId: organisationId,
        description: `Sous-compte supprimé : ${response.name} par ${response.name}`,
        subAccountId: subaccountId,  
      })

      await deleteSubAccount(subaccountId)
      router.refresh()
    } catch (error) {
      console.error('Failed to delete subaccount or save activity log:', error)
    }
  }

  return (
    <div className="text-white flex items-center gap-2" onClick={handleDelete}>
      <TrashIcon size={15} className="text-gray-100" />
      Confirmer
    </div>
  )
}

export default DeleteButton
