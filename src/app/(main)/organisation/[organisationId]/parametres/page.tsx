
import { db } from '@/lib/db'
import React from 'react'
import { currentUser } from '@clerk/nextjs/server'
import OrganisationDetails from '@/components/forms/organisationDetails';
import UserDetails from '@/components/forms/userDetails';

type Props = {
 organisationId: string
}

const page = async ({params}: Props) => {


    const authUser = await currentUser()
   if(!authUser) return null

   const userDetails = await db.user.findUnique({where:{email:authUser.emailAddresses[0].emailAddress}})
  
    if(!userDetails) return null

    const organisationDetails = await db.organisation.findUnique({
        where: {
            id: params.organisationId
        },
        include: {
            SubAccount: true,
        }
    })
    if(!organisationDetails) return null

    const subAccounts = organisationDetails.SubAccount
   return (

    <>
      
    <div className="flex ld:!flex-row flex-col gap-4">
        
        <OrganisationDetails data={organisationDetails}/> 
     <UserDetails type="organisation" id={params.oraganisationId} subAccounts={subAccounts}
        userData= {userDetails} />
  
    </div>
        </>
  )
}

export default page