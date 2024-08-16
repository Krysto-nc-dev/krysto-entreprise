
import React from 'react'

type Props = {
   title: string
  description: string
}

const DashboardHeading = ({ description, title }: Props) => {
  return (
    <section className="mb-6 w-full mt-[3px]  flex items-left flex-col mt-[-30px] ">

    <div className="bg-gradient-to-r from-primary to-secondary-foreground text-transparent bg-clip-text relative">
      <h1 className="text-md font-bold text-[20px]   leading-none">
       {title}
      </h1>
      <p className="text-xs text-muted-foreground mt-1"> {description}</p>
    </div>

  </section>
  )
}

export default DashboardHeading
