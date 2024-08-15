import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import React from 'react';
import { frFR } from "@clerk/localizations";  // Assurez-vous que le package est correctement installé
import ModalProvider from '@/providers/modal-provider';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,  // Assurez-vous que le thème correspond à vos attentes de style
      }}
      localization={frFR}  // Localisation en français
    >
      <ModalProvider>
        {children}
      </ModalProvider>
    </ClerkProvider>
  );
}

export default Layout;
