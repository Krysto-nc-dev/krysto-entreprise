import BlurPage from '@/components/global/blurPage'
import React from 'react'



const PipelinesLayout = ({ children }: { children: React.ReactNode }) => {
  return (

    <div className ="overflow-hidden">
      {children}
    </div>

  );
}

export default PipelinesLayout