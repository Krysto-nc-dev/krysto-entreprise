'use client';
import React from 'react';
import DashboardHeading from '@/components/organisation/dashboardheading';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    CartesianGrid,
    Legend,
} from 'recharts';

const salesData = [
    { month: 'Jan', sales: 4000 },
    { month: 'Fév', sales: 3000 },
    { month: 'Mar', sales: 5000 },
    { month: 'Avr', sales: 4000 },
    { month: 'Mai', sales: 6000 },
    { month: 'Jun', sales: 5000 },
    { month: 'Jui', sales: 7000 },
    { month: 'Aou', sales: 3000 },
    { month: 'Sep', sales: 8000 },
    { month: 'Oct', sales: 3000 },
    { month: 'Nov', sales: 9000 },
    { month: 'Dec', sales: 7000 },
];

const bankBalanceData = [
    { day: 'Lun', balance: 5000 },
    { day: 'Mar', balance: 7000 },
    { day: 'Mer', balance: 8000 },
    { day: 'Jeu', balance: 6000 },
    { day: 'Ven', balance: 9000 },
    { day: 'Sam', balance: 10000 },
    { day: 'Dim', balance: 11000 },
];

const invoiceData = [
    { name: 'Payée', value: 3000 },
    { name: 'En attente', value: 2000 },
    { name: 'En retard', value: 500 },
];

const productSalesData = [
    { product: 'Peignes', sales: 15000 },
    { product: 'Porte savons', sales: 12000 },
    { product: 'Cache pots', sales: 8000 },
];

const serviceSalesData = [
    { service: 'Collecte dechets', sales: 9000 },
    { service: 'Initiation', sales: 7000 },
    { service: 'Web', sales: 5000 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Page = ({ params }: { params: { organisationId: string } }) => {
    return (
        <>
            <DashboardHeading
                title="Tableau de bord de l'organisation"
               
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                {/* Graphique des Ventes */}
                <Card>
                    <CardHeader>
                        <CardTitle>Ventes</CardTitle>
                    </CardHeader>
                    <CardContent className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={salesData}>
                                <XAxis dataKey="month" />
                                <YAxis />
                                <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="sales" stroke="#8884d8" />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Solde Bancaire */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-md ">Solde Bancaire</CardTitle>
                    </CardHeader>
                    <CardContent className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={bankBalanceData}>
                                <XAxis dataKey="day" />
                                <YAxis />
                                <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="balance" fill="#82ca9d" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Factures */}
                <Card>
                    <CardHeader>
                        <CardTitle>Factures</CardTitle>
                    </CardHeader>
                    <CardContent className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={invoiceData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {invoiceData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Carte d'informations supplémentaires */}
            <div className="mt-6">
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>Informations Supplémentaires</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {/* Ventes par produit */}
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Ventes par Produit</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={productSalesData}>
                                        <XAxis dataKey="product" />
                                        <YAxis />
                                        <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="sales" fill="#8884d8" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Ventes par service */}
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Ventes par Service</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={serviceSalesData}>
                                        <XAxis dataKey="service" />
                                        <YAxis />
                                        <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="sales" fill="#82ca9d" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
};

export default Page;
