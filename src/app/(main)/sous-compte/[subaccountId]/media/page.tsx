import {getMedia} from '@/lib/queries'
import BlurPage from '@/components/global/blurPage';
import React from 'react'
import MediaComponent from '@/components/media'

type Props = {
    params: {subaccountId: string}
} 
const page = async ({params}: {params:Props}) => {

    const data =  await getMedia(params.subaccountId)

  
  return (
<div>
    <MediaComponent data= {data} subaccountId={params.subaccountId}/>
</div>
  )
}

export default page

