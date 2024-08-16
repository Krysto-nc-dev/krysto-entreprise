'use client'
import SubAccountDetails from '@/components/forms/subaccountdetails'
import CustomModal from '@/components/global/custommodal'
import { Button } from '@/components/ui/button'
import { useModal } from '@/providers/modal-provider'
import { Organisation, OrganisationSidebarOption, SubAccount, User } from '@prisma/client'
import { PlusCircleIcon } from 'lucide-react'
import React from 'react'
import { twMerge } from 'tailwind-merge'

type Props = {
  user: User & {
    Organisation:
      | (
          | Organisation
          | (null & {
              SubAccount: SubAccount[]
              SideBarOption: OrganisationSidebarOption[]
            })
        )
      | null
  }
  id: string
  className: string
}

const CreateSubaccountButton = ({ className, id, user }: Props) => {
  const { setOpen } = useModal()
  const organisationDetails = user?.Organisation

  if (!organisationDetails) return

  return (
    <Button
      className={twMerge('w-full flex gap-4', className)}
      onClick={() => {
        setOpen(
          <CustomModal
            title="Create a Subaccount"
            subheading="You can switch between different subaccounts."
          >
            <SubAccountDetails
              organisationDetails={organisationDetails}
              userId={user.id}
              userName={user.name}
            />
          </CustomModal>
        )
      }}
    >
      <PlusCircleIcon size={15} />
      Create Sub Account
    </Button>
  )
}

export default CreateSubaccountButton
