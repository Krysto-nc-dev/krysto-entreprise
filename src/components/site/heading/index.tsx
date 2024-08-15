
import React from 'react'

type Props = {
   title: string
  description: string
}

const Heading = ({ description, title }: Props) => {
  return (
    <section className=" h-[200px] w-full pt-36 pl-6 relative flex items-left flex-col mt-[-60px] ">

    <div className="bg-gradient-to-r from-primary to-secondary-foreground text-transparent bg-clip-text relative">
      <h1 className="text-md font-bold  md:text-[30px] leading-none">
       {title}
      </h1>
      <p className="text-xs text-muted-foreground"> {description}</p>
    </div>
    <div className="flex justify-center relative items-center mt-[-20px] md:mt-[-70px]">

      <div className="bottom-0 top-[50%] bg-gradient-to-t dark:from-background left-0 right-0 absolute z-10"></div>
    </div>
  </section>
  )
}

export default Heading
