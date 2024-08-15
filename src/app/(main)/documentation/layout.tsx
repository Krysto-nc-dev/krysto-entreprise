

import BlurPage from '@/components/global/blurpage'
import React from 'react'


type Props = {
    children: React.ReactNode,
    
}

const Layout = async ({ children }: Props) => {
  return (

   
    <div>
        <BlurPage>
            {children}
        </BlurPage>
    </div>


  )
}

export default Layout