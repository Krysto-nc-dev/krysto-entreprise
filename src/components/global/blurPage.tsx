import React from 'react'

type Props = {
  children: React.ReactNode
}

const BlurPage = ({ children }: Props) => {
  return (
    <div
      className="h-screen overflow-scroll backdrop-blur-[35px] bg-gradient-to-tr from-white/60 via-white/30 to-primary/30 dark:bg-gradient-to-tr dark:from-gray-800/70 dark:via-gray-700/40 dark:to-gray-600/30 mx-auto pt-24 p-4 absolute top-0 right-0 left-0 bottom-0 z-[11]"
      id="blur-page"
    >
      {children}
    </div>
  )
}

export default BlurPage
