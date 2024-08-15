
import Unauthorized from '@/components/unauthorized'
import React from 'react'
import {verifyAndAcceptInvitation, getAuthUserDetails} from '@/lib/queries'
import { permission } from 'process'
type Props = {
  searchParams : {state:string ; code: string}
}

const page = async ({searchParams}: Props) => {

  const organisationId = await verifyAndAcceptInvitation()

  if(!organisationId) {
  return <Unauthorized/>
  }


  const user = await getAuthUserDetails()

  if(!user) {
return
  }


  const getFirstSubaccountWithAccess = user.Permissions.find((permission) => permission.access === true)
   
   if(searchParams.state)

    {
      const statePath = searchParams.state.split('___')[0]
      const stateSubaccountId = searhParams.state.split('___')[1]
      if( !stateSubaccountId)   return <Unauthorized/>
      return  redirect(`/sous-compte/${stateSubaccountId}/${statePath}?code=${searchParams.code}`)
       
   
    }


    if(getFirstSubaccountWithAccess) {
      return redirect(`/sous-compte/${getFirstSubaccountWithAccess.subaccount.id}/dashboard`)
    }

   return (
    <Unauthorized/>
  )
}

export default page