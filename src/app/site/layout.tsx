import Navigation from '@/components/site/navigation'

import { ClerkProvider } from '@clerk/nextjs'
import { dark } from '@clerk/themes'
import React from 'react'
// fr-FR locale is imported as frFR
import { frFR } from "@clerk/localizations";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
      }}
      localization={frFR}
    >
      <main className="h-full">
        <Navigation />
        {children}
     
      </main>
    </ClerkProvider>
  )
}

export default layout
