import { ModeToggle } from '@/components/global/modeToggle'
import { UserButton } from '@clerk/nextjs'
import { User } from '@clerk/nextjs/server'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

type Props = {
  user?: null | User
}

const Navigation = ({ user }: Props) => {
  return (
    <div className="fixed top-0 right-0 left-0 p-4 flex items-center justify-between z-10 ">
      <aside className="flex items-center gap-2">
        <Image
          src={'./assets/krysto_logo.svg'}
          width={30}
          height={30}
          alt="Krysto Logo"
        />
        <span className="text-xl font-bold"> Krysto.</span>
      </aside>
      <nav className="hidden md:block absolute left-[50%] top-[50%] transform translate-x-[-50%] translate-y-[-50%]">
        <ul className="flex items-center justify-center gap-8 text-sm font-bold">
          <Link href={'/'}>Acceuil</Link>
          <Link href={'/site/fonctionnalites'}>Fonctionnalités</Link>
          <Link href={'/site/documentation'}>Documentation</Link>
          <Link href={'/site/contact'}>Contact</Link>
        </ul>
      </nav>
      <aside className="flex gap-2 items-center">
        <Link
          href={'/organisation'}
          className="bg-primary text-white  p-1 px-3 rounded-md hover:bg-primary/80 text-lg"
        >
          Connexion
        </Link>
        <UserButton />
         <ModeToggle /> 
      </aside>
    </div>
  )
}

export default Navigation
