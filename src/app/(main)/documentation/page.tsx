import React from 'react';
import Link from 'next/link';
import { ArrowLeftCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'; // Assuming you have a Card component from Shadcn

type Props = {}

const DocumentationHome = (props: Props) => {
  return (
    <div className="">
      <div className="max-w-7xl mx-auto">
        <div className=" shadow-lg rounded-lg overflow-hidden">
          <div className="px-6 py-8">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-primary">Documentation</h1>
              <Link className="flex items-center text-blue-600 hover:text-blue-800" href="/organisation">
                <ArrowLeftCircle className="mr-2" size={24} />
                Retour au tableau de bord
              </Link>
            </div>
            <p className="mt-4 text-gray-700">
              Bienvenue dans la documentation ! Vous trouverez ici tout ce dont vous avez besoin pour apprendre à utiliser notre plateforme, y compris des guides, des tutoriels et des références API. Utilisez la navigation ci-dessous pour explorer les différentes sections.
            </p>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-xl transition-shadow duration-150 ease-in-out">
                <Link href="/documentation/overview">
                  <CardHeader>
                    <CardTitle className="text-xl text-gray-800">Aperçu</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600">Obtenez une vue d'ensemble de notre plateforme et de ses capacités.</CardDescription>
                  </CardContent>
                </Link>
              </Card>
              
              <Card className="hover:shadow-xl transition-shadow duration-150 ease-in-out">
                <Link href="/documentation/getting-started">
                  <CardHeader>
                    <CardTitle className="text-xl text-gray-800">Premiers pas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600">Découvrez comment démarrer avec notre plateforme rapidement et efficacement.</CardDescription>
                  </CardContent>
                </Link>
              </Card>
              <Card className="hover:shadow-xl transition-shadow duration-150 ease-in-out">
                <Link href="/documentation/subaccounts">
                  <CardHeader>
                    <CardTitle className="text-xl text-gray-800">Sous-Comptes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600">Découvrez comment démarrer avec notre plateforme rapidement et efficacement.</CardDescription>
                  </CardContent>
                </Link>
              </Card>
              <Card className="hover:shadow-xl transition-shadow duration-150 ease-in-out">
                <Link href="/documentation/subaccounts">
                  <CardHeader>
                    <CardTitle className="text-xl text-gray-800">Utilisateurs et permissions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600">Découvrez comment démarrer avec notre plateforme rapidement et efficacement.</CardDescription>
                  </CardContent>
                </Link>
              </Card>
              
              <Card className="hover:shadow-xl transition-shadow duration-150 ease-in-out">
                <Link href="/documentation/components">
                  <CardHeader>
                    <CardTitle className="text-xl text-gray-800">Composants</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600">Explorez nos composants UI et comment les utiliser dans vos projets.</CardDescription>
                  </CardContent>
                </Link>
              </Card>

              <Card className="hover:shadow-xl transition-shadow duration-150 ease-in-out">
                <Link href="/documentation/settings">
                  <CardHeader>
                    <CardTitle className="text-xl text-gray-800">Réglages</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600">Personnalisez et configurez votre compte pour une meilleure expérience.</CardDescription>
                  </CardContent>
                </Link>
              </Card>

              <Card className="hover:shadow-xl transition-shadow duration-150 ease-in-out">
                <Link href="/documentation/modules">
                  <CardHeader>
                    <CardTitle className="text-xl text-gray-800">Modules</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600">Apprenez à utiliser les différents modules pour optimiser votre travail.</CardDescription>
                  </CardContent>
                </Link>
              </Card>

              <Card className="hover:shadow-xl transition-shadow duration-150 ease-in-out">
                <Link href="/documentation/support">
                  <CardHeader>
                    <CardTitle className="text-xl text-gray-800">Support et FAQ</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600">Trouvez des réponses aux questions fréquentes et contactez notre support.</CardDescription>
                  </CardContent>
                </Link>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DocumentationHome;
