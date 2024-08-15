import Link from 'next/link'
import React from 'react'

type Props = {}

const Unauthorized = (props: Props) => {
  return (
    <div className="p-4 text-center h-screen w-screen flex justify-center items-center flex-col">
      <h1 className="text-3xl md:text-6xl">Accès non autorisé!</h1>
      <p>Oups! On dirait que vous avez pris un mauvais virage.</p>
      <p>Veuillez contacter le support ou le propriétaire de l'entreprise pour obtenir l'accès.</p>
      <Link
        href="/"
        className="mt-4 bg-primary p-2 rounded text-white"
      >
        Retour à l'accueil 
      </Link>
      <div className="mt-8">
        <img   src="https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExdHYyaWY4OGhxYTFudHl2cmMybXY0MDB2Z2IxcG5mNWUybTJydDIybCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/7uU59bOjkGMT53Zyhd/giphy.webp" alt="Unauthorized Cat" className="w-84 h-64" />
        {/* <p className="italic mt-2">Même ce chat n'a pas accès...</p> */}
      </div>
    </div>
  )
}

export default Unauthorized
