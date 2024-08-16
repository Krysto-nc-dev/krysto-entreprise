'use client';
import React, { useState } from 'react';
import DashboardHeading from '@/components/organisation/dashboardheading';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import Link from 'next/link';

const initialModules = [
    {
        id: 1,
        category: "outils",
        title: 'Mots de passe',
        description: "Générez et accédez en un clin d'oeil à tous vos mots de passe",
        price: 'Inclus dans l\'abonnement',
        included: true,
        active: true,
        image: '/assets/passwordModule.png',
    },
    {
        id: 2,
        title: 'RSE',
        category: "Environnement",
        description: 'Créez vos rapports RSE à partager avec toutes vos parties prenantes',
        price: 'Inclus dans l\'abonnement',
        included: true,
        active: true,
        image: '/assets/rseModule.jpeg',
    },
    {
        id: 3,
        title: 'Compt +',
        category: "Comptabilité",
        description: 'Facilitez-vous la comptabilité avec des outils automatisés',
        price: '€30',
        included: false,
        active: false,
        image: '/assets/comptaModule.jpeg',
    },
    {
        id: 4,
        title: 'Data Pilot',
        category: "Gestion de données",
        description: 'Analysez vos données et prenez des décisions éclairées',
        price: '€30',
        included: false,
        active: false,
        image: '/assets/dataModule.jpeg',
    },
    {
        id: 5,
        title: 'CRM Avancé',
        category: "Outils",
        description: 'Gérez vos relations clients avec des fonctionnalités avancées',
        price: '€50',
        included: false,
        active: false,
        image: '/assets/crmModule.jpg',
    },
    {
        id: 6,
        title: 'Gestion de Projets',
        category: "Productivité",
        description: 'Planifiez et suivez vos projets efficacement',
        price: '€40',
        included: false,
        active: false,
        image: '/assets/projectModule.jpg',
    },
    {
        id: 7,
        title: 'Gestion des Stocks',
        category: "Logistique",
        description: 'Suivez et gérez vos inventaires en temps réel',
        price: '€35',
        included: false,
        active: false,
        image: '/assets/stockModule.jpeg',
    },
    {
        id: 8,
        title: 'Marketing Automation',
        category: "Marketing",
        description: 'Automatisez vos campagnes marketing pour maximiser votre impact',
        price: '€60',
        included: false,
        active: false,
        image: '/assets/marketingModule.jpeg',
    },
    {
        id: 9,
        title: 'Sécurité Réseau',
        category: "Sécurité",
        description: 'Protégez votre infrastructure réseau avec des outils de sécurité avancés',
        price: '€80',
        included: false,
        active: false,
        image: '/assets/securityModule.jpeg',
    },
    {
        id: 10,
        title: 'Gestion des Ressources Humaines',
        category: "RH",
        description: 'Gérez efficacement les données de vos employés et les processus RH',
        price: '€70',
        included: false,
        active: false,
        image: '/assets/hrModule.jpeg',
    },
    {
        id: 11,
        title: 'Analyse Financière',
        category: "Finance",
        description: 'Analysez vos performances financières avec des rapports détaillés',
        price: '€90',
        included: false,
        active: false,
        image: '/assets/financeModule.jpeg',
    },
    {
        id: 12,
        title: 'Support Client',
        category: "Service Client",
        description: 'Améliorez votre service client avec des outils de support dédiés',
        price: '€45',
        included: false,
        active: false,
        image: '/assets/supportModule.jpeg',
    },
];

const Page = ({ params }: { params: { organisationId: string } }) => {
    const [modules, setModules] = useState(initialModules);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedActive, setSelectedActive] = useState('all');
    const [selectedIncluded, setSelectedIncluded] = useState('all');
    const [selectedModule, setSelectedModule] = useState<null | typeof modules[0]>(null);

    const filteredModules = modules.filter((module) => {
        const matchesCategory = selectedCategory === 'all' || module.category === selectedCategory;
        const matchesSearchTerm = module.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesActive = selectedActive === 'all' || (selectedActive === 'active' && module.active) || (selectedActive === 'inactive' && !module.active);
        const matchesIncluded = selectedIncluded === 'all' || (selectedIncluded === 'included' && module.included) || (selectedIncluded === 'not_included' && !module.included);

        return matchesCategory && matchesSearchTerm && matchesActive && matchesIncluded;
    });

    const handleToggleChange = (moduleId: number) => {
        setModules((prevModules) =>
            prevModules.map((module) =>
                module.id === moduleId ? { ...module, active: !module.active } : module
            )
        );
    };

    const openDrawer = (module: typeof modules[0]) => {
        setSelectedModule(module);
    };

    return (
        <>
            <DashboardHeading
                title='Modules'
                description="Vous pouvez activer/désactiver des modules supplémentaires depuis cette page"
            />
            <div className="flex justify-between items-center mb-4 space-x-4">
                <Input
                    placeholder="Rechercher un module..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-1/3"
                />
                <Select onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Filtrer par catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Toutes les catégories</SelectItem>
                        <SelectItem value="outils">Outils</SelectItem>
                        <SelectItem value="Environement">Environnement</SelectItem>
                        <SelectItem value="Comptabilité">Comptabilité</SelectItem>
                        <SelectItem value="Gestion de donées">Gestion de données</SelectItem>
                        <SelectItem value="Productivité">Productivité</SelectItem>
                        <SelectItem value="Logistique">Logistique</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                        <SelectItem value="Sécurité">Sécurité</SelectItem>
                        <SelectItem value="RH">Ressources Humaines</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                        <SelectItem value="Service Client">Service Client</SelectItem>
                    </SelectContent>
                </Select>
                <Select onValueChange={setSelectedActive}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Filtrer par statut" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tous les statuts</SelectItem>
                        <SelectItem value="active">Actif</SelectItem>
                        <SelectItem value="inactive">Inactif</SelectItem>
                    </SelectContent>
                </Select>
                <Select onValueChange={setSelectedIncluded}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Filtrer par inclusion" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tous</SelectItem>
                        <SelectItem value="included">Inclus</SelectItem>
                        <SelectItem value="not_included">Non inclus</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <section className="flex flex-wrap items-center w-full gap-4 justify-between max-md:justify-center">
                {filteredModules.map((module) => (
                    <Card key={module.id} className="relative w-[350px] h-[350px]  flex flex-col justify-between max-md:w-[100%]">
                        <div className="w-full h-24 relative">
                            <Image src={module.image} alt={module.title} fill className="object-cover rounded-md" />
                        </div>
                        <Badge className="absolute top-2 right-2 text-white">{module.price}</Badge>
                        <CardHeader>
                            <CardTitle className="text-sm">{module.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col justify-between flex-1">
                            <CardDescription className="mb-4">{module.description}</CardDescription>
                            <div>
                                <Link href={`modules/${module.id}`}>
                                <Button className="w-full" variant="outline">
                                détails
                                            </Button>
                                </Link>
                            </div>
                            <div className="flex justify-between items-center mt-auto">
                                {module.included ? (
                                    <>
                                        <span className="text-sm">{module.active ? 'Désactiver' : 'Activer'}</span>
                                        <Switch
                                            checked={module.active}
                                            onCheckedChange={() => handleToggleChange(module.id)}
                                        />
                                    </>
                                ) : (
                                    <Drawer>
                                        <DrawerTrigger asChild>
                                            <Button className="w-full" variant="outline" onClick={() => openDrawer(module)}>
                                                Demande de devis
                                            </Button>
                                        </DrawerTrigger>
                                        <DrawerContent className="w-full">
                                            <div className="p-4">
                                                <DrawerHeader>
                                                    <DrawerTitle>Demande de devis pour {selectedModule?.title}</DrawerTitle>
                                                    <DrawerDescription>
                                                        Veuillez remplir le formulaire ci-dessous pour demander un devis pour ce module.
                                                    </DrawerDescription>
                                                </DrawerHeader>
                                                {/* Your form elements go here */}
                                                <Input placeholder="Votre nom" className="mb-4" />
                                                <Input placeholder="Votre email" className="mb-4" />
                                                <Input placeholder="Votre téléphone" className="mb-4" />
                                                <DrawerFooter>
                                                    <Button className="w-full">
                                                        Envoyer la demande
                                                    </Button>
                                                    <DrawerClose asChild>
                                                        <Button variant="outline" className="w-full mt-4">
                                                            Fermer
                                                        </Button>
                                                    </DrawerClose>
                                                </DrawerFooter>
                                            </div>
                                        </DrawerContent>
                                    </Drawer>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {filteredModules.length === 0 && (
                    <div className="text-center text-gray-500 mt-8">
                        Aucun module ne correspond à vos critères.
                    </div>
                )}
            </section>
        </>
    );
};

export default Page;
