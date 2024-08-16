import BlurPage from '@/components/global/blurpage'
import React from 'react'



const PipelinesLayout = ({ children }: { children: React.ReactNode }) => {
  return (

    <BlurPage className ="overflow-hidden">
      {children}
    </BlurPage>

  );
}

export default PipelinesLayout