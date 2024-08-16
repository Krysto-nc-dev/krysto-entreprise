import { getAuthUserDetails, verifyAndAcceptInvitation } from '@/lib/queries'
import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import React from 'react'
import { Plan } from '@prisma/client'
import OrganisationDetails from '@/components/forms/organisationdetails'


const page = async ({
  searchParams,
}: {
  searchParams: { plan?: Plan; state?: string; code?: string }
}) => {
  const organisationId = await verifyAndAcceptInvitation()
   
  // get user details
  const user = await getAuthUserDetails()
 

  if (organisationId) {
    if (user?.role === 'SUBACCOUNT_GUEST' || user?.role === 'SUBACCOUNT_USER') {
      return redirect('/sous-compte')
    } else if (
      user?.role === 'ORGANISATION_OWNER' ||
      user?.role === 'ORGANISATION_ADMIN'
    ) {
      if (searchParams.plan) {
        return redirect(
          `/organisation/${organisationId}/billing?plan=${searchParams.plan}`,
        )
      }
      if (searchParams.state) {
        const [statePath, stateOrganisationId] = searchParams.state.split('___')
        if (stateOrganisationId) return <div>Non autorisé</div>
        return redirect(
          `/organisation/${stateOrganisationId}/${statePath}?code=${searchParams.code}`,
        )
      } else {
        return redirect(`/organisation/${organisationId}`)
      }
    } else {
      return <div className='text-red-400'>Non autorisé ! </div>
    }
  }

  const authUser = await currentUser()

  return (
    <div className="flex justify-center items-center mt-4">
      <div className="max-w-[950px] p-4 rounded-xl">
        <h1 className="text-2xl text-primary">Créer votre entreprise</h1>
          <OrganisationDetails data={{companyEmail: authUser?.emailAddresses[0].emailAddress}}/>
      </div>
    </div>
  )
}

export default page
