'use client'
import ContactUserForm from '@/components/forms/contact-user-form'
import CustomModal from '@/components/global/custommodal'
import { Button } from '@/components/ui/button'
import { useModal } from '@/providers/modal-provider'
import { saveActivityLogsNotification } from '@/lib/queries'
import React from 'react'

type Props = {
  subaccountId: string
}

const CreateContactButton = ({ subaccountId }: Props) => {
  const { setOpen } = useModal()

  const handleCreateContact = async () => {
    const onSave = async (contactId: string) => {
      // After the contact is successfully created, save the notification log
      try {
        await saveActivityLogsNotification({
        organisationId: undefined,
          subAccountId: subaccountId,
          description: `Nouveau contact créé avec l'ID: ${contactId}`,
        })
        console.log('Notification log saved successfully')
      } catch (error) {
        console.error('Failed to save notification log', error)
      }
    }

    setOpen(
      <CustomModal
        title="Créer ou Mettre à jour les informations de contact"
        subheading="Les contacts sont comme des clients."
      >
        <ContactUserForm subaccountId={subaccountId} onSave={onSave} />
      </CustomModal>
    )
  }

  return <Button onClick={handleCreateContact}>Créer un Contact</Button>
}

export default CreateContactButton
