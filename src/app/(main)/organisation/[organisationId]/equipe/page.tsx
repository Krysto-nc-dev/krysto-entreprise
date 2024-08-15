import { db } from '@/lib/db';
import React from 'react';
import DataTable from './data-table';
import { Plus } from 'lucide-react';
import { currentUser } from '@clerk/nextjs/server';
import { columns } from './columns';
import SendInvitation from '@/components/forms/send-invitation';

type Props = {
  params: { organisationId: string };
};

const TeamPage = async ({ params }: Props) => {
  const authUser = await currentUser();

  if (!authUser) return null;

  const teamMembers = await db.user.findMany({
    where: {
      organisationId: params.organisationId, // Utilise `organisationId` directement pour la requête
    },
    include: {
      Organisation: true, // Inclure Organisation si nécessaire
      Permissions: true, // Inclure Permissions si nécessaire
    },
  });

  const organisationDetails = await db.organisation.findUnique({
    where: {
      id: params.organisationId,
    },
    include: {
      SubAccount: true, // Inclure SubAccount si nécessaire
    },
  });

  if (!organisationDetails) return null;

  return (
    <DataTable
      actionButtonText={
        <>
          <Plus size={15} />
          Ajouter
        </>
      }
      modalChildren={<SendInvitation organisationId={params.organisationId} />}
      filterValue="name"
      columns={columns}
      data={teamMembers}
    />
  );
};

export default TeamPage;
