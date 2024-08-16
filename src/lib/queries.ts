'use server'

import { clerkClient, currentUser } from '@clerk/nextjs/server'
import { db } from './db'
import { redirect } from 'next/navigation'
import { SubAccount, User, Organisation, Role, Lane, Ticket, Icon, Tag, Plan } from '@prisma/client'
import { v4 } from 'uuid'
import { Prisma } from '@prisma/client'
import axios from 'axios' 




export const getAuthUserDetails = async () => {
  const user = await currentUser()
  if (!user) {
    return
  }

  const userData = await db.user.findUnique({
    where: {
      email: user.emailAddresses[0].emailAddress,
    },
    include: {
      Organisation: {
        include: {
          SidebarOption: true,
          SubAccount: {
            include: {
              SidebarOption: true,
            },
          },
        },
      },
      Permissions: true,
    },
  })
  return userData
}

export const getOrganisationDetails = async (organisationId: string) => {
  const response = await db.organisation.findUnique({
    where: { id: organisationId },
  })
  return response
}

export const saveActivityLogsNotification = async ({
  organisationId,
  description,
  subAccountId,
}: {
  organisationId?: string
  description: string
  subAccountId?: string
}) => {
  const authUser = await currentUser()
  let userData

  if (!authUser) {
    const response = await db.user.findFirst({
      where: {
        Organisation: {
          SubAccount: {
            some: { id: subAccountId },
          },
        },
      },
    })
    if (response) {
      userData = response
    }
  } else {
    userData = await db.user.findUnique({
      where: {
        email: authUser.emailAddresses[0].emailAddress,
      },
    })
  }

  if (!userData) {
    console.log('Utilisateur non trouvé')
    return
  }

  let foundOrganisationId = organisationId

  // Ensure one of the IDs is provided
  if (!subAccountId && !organisationId) {
    throw new Error(
      "Vous devez fournir un identifiant de sous-compte ou un identifiant d'organisation",
    )
  }

  if (!organisationId && subAccountId) {
    const subAccountResponse = await db.subAccount.findUnique({
      where: { id: subAccountId },
    })

    if (subAccountResponse) {
      foundOrganisationId = subAccountResponse.organisationId
    }
  }

  const notificationData: any = {
    notification: `${userData.name} | ${description}`,
    User: {
      connect: {
        id: userData.id,
      },
    },
    Organisation: {
      connect: {
        id: foundOrganisationId,
      },
    },
  }

  if (subAccountId) {
    notificationData.SubAccount = {
      connect: {
        id: subAccountId,
      },
    }
  }

  await db.notification.create({
    data: notificationData,
  })
}


export const createTeamUser = async (organisationId: string, user: User) => {
  if (user.role === 'ORGANISATION_OWNER') return null
  const response = await db.user.create({ data: { ...user, organisationId } })
  return response
}

export const verifyAndAcceptInvitation = async () => {
  const user = await currentUser()

  if (!user) {
    redirect('organisation/connexion')
    return
  }

  const invitationExists = await db.invitation.findUnique({
    where: {
      email: user.emailAddresses[0].emailAddress,
      status: 'PENDING',
    },
  })

  if (invitationExists) {
    const userDetails = await createTeamUser(invitationExists?.organisationId, {
      email: invitationExists.email,
      organisationId: invitationExists.organisationId,
      avatarUrl: user?.imageUrl,
      id: user?.id,
      name: `${user?.firstName} ${user?.lastName}`,
      role: invitationExists.role,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    await saveActivityLogsNotification({
      organisationId: invitationExists?.organisationId,
      description: "Utilisateur accepté dans l'organisation",
      subAccountId: undefined,
    })

    if (userDetails) {
      await clerkClient().users.updateUserMetadata(user.id, {
        privateMetadata: {
          role: userDetails.role || 'SUBACCOUNT_USER',
        },
      })
      await db.invitation.delete({
        where: {
          email: userDetails.email,
        },
      })

      return userDetails.organisationId
    } else {
      return null
    }
  } else {
    const organisation = await db.user.findUnique({
      where: {
        email: user.emailAddresses[0].emailAddress,
      },
    })
    return organisation ? organisation.organisationId : null
  }
}


export const updateOrganisationDetails = async (
  organisationId: string,
  organisationDetails: Partial<Organisation>,
) => {
  const response = await db.organisation.update({
    where: {
      id: organisationId,
    },
    data: { ...organisationDetails },
  })
  return response
}

export const deleteOrganisation = async (organisationId: string) => {
  const response = await db.organisation.delete({
    where: { id: organisationId },
  })
  return response
}

export const initUser = async (newUser: Partial<User>) => {
  const user = await currentUser()
  if (!user) return

  const userData = await db.user.upsert({
    where: {
      email: user.emailAddresses[0].emailAddress,
    },
    update: newUser,
    create: {
      id: user.id,
      avatarUrl: user.imageUrl,
      email: user.emailAddresses[0].emailAddress,
      name: `${user.firstName} ${user.lastName}`,
      role: newUser.role || 'SUBACCOUNT_USER',
    },
  })

  await clerkClient().users.updateUserMetadata(user.id, {
    privateMetadata: {
      role: newUser.role || 'SUBACCOUNT_USER',
    },
  })

  return userData
}





export const upsertOrganisation = async (
  organisation: Organisation,
  price?: Plan,
) => {
  if (!organisation.companyEmail) return null;

  try {
    // Vérifiez d'abord si l'utilisateur existe
    const existingUser = await db.user.findUnique({
      where: { email: organisation.companyEmail },
    });

    if (!existingUser) {
      // Si l'utilisateur n'existe pas, vous devez le créer d'abord
      await db.user.create({
        data: {
          email: organisation.companyEmail,
          name: organisation.legalRepresentative || 'Nom par défaut',
          avatarUrl: '', // ou toute autre valeur par défaut
          role: 'ORGANISATION_OWNER', // ou un autre rôle selon vos besoins
          organisationId: organisation.id, // Assigner l'organisation directement
        },
      });
    } else {
      // Si l'utilisateur existe, mettez à jour son organisationId si nécessaire
      if (!existingUser.organisationId) {
        await db.user.update({
          where: { email: organisation.companyEmail },
          data: { organisationId: organisation.id },
        });
      }
    }

    const formattedFoundingDate = organisation.foundingDate
      ? new Date(organisation.foundingDate).toISOString()
      : null;

    const organisationDetails = await db.organisation.upsert({
      where: {
        id: organisation.id,
      },
      update: {
        ...organisation,
        foundingDate: formattedFoundingDate,
        updatedAt: new Date(),
      },
      create: {
        id: organisation.id,
        name: organisation.name,
        companyEmail: organisation.companyEmail,
        companyPhone: organisation.companyPhone,
        whiteLabel: organisation.whiteLabel,
        tgcAssujeti: organisation.tgcAssujeti,
        address: organisation.address,
        city: organisation.city,
        zipCode: organisation.zipCode,
        province: organisation.province,
        country: organisation.country,
        organisationType: organisation.organisationType,
        ridet: organisation.ridet,
        fiscalYearStart: organisation.fiscalYearStart,
        fiscalYearEnd: organisation.fiscalYearEnd,
        bp: organisation.bp,
        organisationLogo: organisation.organisationLogo,
        legalRepresentative: organisation.legalRepresentative,
        businessType: organisation.businessType,
        website: organisation.website,
        companyDescription: organisation.companyDescription,
        numberOfEmployees: organisation.numberOfEmployees,
        foundingDate: formattedFoundingDate,
        tgcNumber: organisation.tgcNumber,
        isActive: organisation.isActive,
        createdAt: new Date(),
        updatedAt: new Date(),
        users: {
          connect: { email: organisation.companyEmail },
        },
        SidebarOption: {
          create: [
            {
              name: 'Tableau de bord',
              category: "DASHBOARD",
              icon: Icon.chart,
              link: `/organisation/${organisation.id}`,
            },
            {
              name: 'Tiers',
              icon: Icon.category,
              category: "TIERS",
              link: `/organisation/${organisation.id}/tiers`,
            },
            {
              name: 'Banques & caisse',
              icon: Icon.wallet,
              category: "BANQUE",
              link: `/organisation/${organisation.id}/banques`,
            },
            {
              name: 'Entrepôts',
              category: "BANQUE",
              icon: Icon.category,
              link: `/organisation/${organisation.id}/entrepots`,
            },
            {
              name: 'Demmarage',
              category: "BANQUE",
              icon: Icon.clipboardIcon,
              link: `/organisation/${organisation.id}/demarrage`,
            },
            {
              name: 'Facturation',
              category: "BANQUE",
              icon: Icon.payment,
              link: `/organisation/${organisation.id}/facturation`,
            },
            {
              name: 'Devis',
              category: "BANQUE",
              icon: Icon.wallet,
              link: `/organisation/${organisation.id}/devis`,
            },
            {
              name: 'Facturation Fournisseur',
              category: "BANQUE",
              icon: Icon.wallet,
              link: `/organisation/${organisation.id}/facture-fournisseur`,
            },
            {
              name: 'Produit',
              category: "PRODUIT",
              icon: Icon.wallet,
              link: `/organisation/${organisation.id}/produits`,
            },
            {
              name: 'Service',
              category: "SERVICE",
              icon: Icon.wallet,
              link: `/organisation/${organisation.id}/services`,
            },
            {
              name: 'Paramétres',
              category: "DOCUMENTATION",
              icon: Icon.settings,
              link: `/organisation/${organisation.id}/parametres`,
            },
            {
              name: 'Sous-comptes',
              category: "GESTION_DES_UTILISATEURS",
              icon: Icon.person,
              link: `/organisation/${organisation.id}/sous-comptes`,
            },
            {
              name: 'Equipe',
              category: "RH",
              icon: Icon.shield,
              link: `/organisation/${organisation.id}/equipe`,
            },
          ],
        },
      },
    });

    return organisationDetails;
  } catch (error) {
    console.error('Error during organisation upsert:', error);
    throw error;
  }
};


export const getNotificationAndUser = async (organisationId: string) => {
  try {
    const response = await db.notification.findMany({
      where: { organisationId },
      include: {
        User: true,
      },
      orderBy: { createdAt: 'desc' },
    })
    return response
  } catch (error) {
    console.log(error)
  }
}

export const upsertSubAccount = async (subAccount: SubAccount) => {
  if (!subAccount.companyEmail) return null
  const organisationOwner = await db.user.findFirst({
    where: {
      Organisation: {
        id: subAccount.organisationId,
      },
      role: 'ORGANISATION_OWNER',
    },
  })
  if (!organisationOwner)
    return console.log('🔴Error: could not create subaccount')
  const permissionId = v4()
  const response = await db.subAccount.upsert({
    where: { id: subAccount.id },
    update: subAccount,
    create: {
      ...subAccount,
      Permissions: {
        create: {
          access: true,
          email: organisationOwner.email,
          id: permissionId,
        },
        connect: {
          subAccountId: subAccount.id,
          id: permissionId,
        },
      },
      Pipeline: {
        create: { name: 'Lead Cycle' },
      },
      SidebarOption: {
        create: [
          {
            name: 'Demmarage',
            icon: 'clipboardIcon',
            category: "RH",
            link: `/sous-compte/${subAccount.id}/launchpad`,
          },
          {
            name: 'Paramétres',
            category: "RH",
            icon: 'settings',
            link: `/sous-compte/${subAccount.id}/settings`,
          },
          {
            name: 'Funnels',
            category: "RH",
            icon: 'pipelines',
            link: `/sous-compte/${subAccount.id}/funnels`,
          },
          {
            name: 'Media',
            category: "RH",
            icon: 'database',
            link: `/sous-compte/${subAccount.id}/media`,
          },
          {
            name: 'Automations',
            category: "RH",
            icon: 'chip',
            link: `/sous-compte/${subAccount.id}/automations`,
          },
          {
            name: 'Pipelines',
            category: "RH",
            icon: 'flag',
            link: `/sous-compte/${subAccount.id}/pipelines`,
          },
          {
            name: 'Contacts',
            category: "RH",
            icon: 'person',
            link: `/sous-compte/${subAccount.id}/contacts`,
          },
          {
            name: 'Dashboard',
            category: "RH",
            icon: 'category',
            link: `/sous-compte/${subAccount.id}`,
          },
        ],
      },
    },
  })

  return response
}

export const getUserPermissions = async (userId: string) => {
  const response = await db.user.findUnique({
    where: { id: userId },
    select: { Permissions: { include: { SubAccount: true } } },
  })

  return response
}

export const updateUser = async (user: Partial<User>) => {
  const response = await db.user.update({
    where: { email: user.email },
    data: { ...user },
  })

  await clerkClient().users.updateUserMetadata(response.id, {
    privateMetadata: {
      role: user.role || 'SUBACCOUNT_USER',
    },
  })

  return response
}

export const changeUserPermissions = async (
  permissionId: string | undefined,
  userEmail: string,
  subAccountId: string,
  permission: boolean,
) => {
  try {
    const response = await db.permissions.upsert({
      where: { id: permissionId },
      update: { access: permission },
      create: {
        access: permission,
        email: userEmail,
        subAccountId: subAccountId,
      },
    })
    return response
  } catch (error) {
    console.log('🔴Could not change permission', error)
  }
}

export const getSubaccountDetails = async (subaccountId: string) => {
  const response = await db.subAccount.findUnique({
    where: {
      id: subaccountId,
    },
  })
  return response
}

export const deleteSubAccount = async (subaccountId: string) => {
  const response = await db.subAccount.delete({
    where: {
      id: subaccountId,
    },
    include: {
      SidebarOption: true, // Assurez-vous que ce champ correspond à votre modèle Prisma
    },
  })
  return response
}

export const deleteUser = async (userId: string) => {
  await clerkClient().users.updateUserMetadata(userId, {
    privateMetadata: {
      role: undefined,
    },
  })
  const deletedUser = await db.user.delete({ where: { id: userId } })

  return deletedUser
}

export const getUser = async (id: string) => {
  const user = await db.user.findUnique({
    where: {
      id,
    },
  })

  return user
}

export const sendInvitation = async (
  role: Role,
  email: string,
  organisationId: string,
) => {
  const response = await db.invitation.create({
    data: { email, organisationId, role },
  })

  try {
    await clerkClient().invitations.createInvitation({
      emailAddress: email,
      redirectUrl: process.env.NEXT_PUBLIC_URL,
      publicMetadata: {
        throughInvitation: true,
        role,
      },
    })
  } catch (error) {
    console.log(error)
    throw error
  }

  return response
}

export const getMedia = async (subaccountId: string) => {
  const mediafiles = await db.subAccount.findUnique({
    where: {
      id: subaccountId,
    },
    include: { Media: true },
  })
  return mediafiles
}

export const createMedia = async (
  subaccountId: string,
  mediaFile: CreateMediaType,
) => {
  const response = await db.media.create({
    data: {
      link: mediaFile.link,
      name: mediaFile.name,
      subAccountId: subaccountId,
    },
  })

  return response
}

export const deleteMedia = async (mediaId: string) => {
  const response = await db.media.delete({
    where: {
      id: mediaId,
    },
  })
  return response
}

export const getPipelineDetails = async (pipelineId: string) => {
  const response = await db.pipeline.findUnique({
    where: {
      id: pipelineId,
    },
  })
  return response
}

export const getLanesWithTicketAndTags = async (pipelineId: string) => {
  const response = await db.lane.findMany({
    where: {
      pipelineId,
    },
    orderBy: { order: 'asc' },
    include: {
      Tickets: {
        orderBy: {
          order: 'asc',
        },
        include: {
          Tags: true,
          Assigned: true,
          Customer: true,
        },
      },
    },
  })
  return response
}

export const upsertFunnel = async (
  subaccountId: string,
  funnel: Prisma.FunnelUncheckedCreateInput & { liveProducts: string },
  funnelId: string,
) => {
  const response = await db.funnel.upsert({
    where: { id: funnelId },
    update: funnel,
    create: {
      ...funnel,
      id: funnelId || v4(),
      subAccountId: subaccountId,
    },
  })

  return response
}

export const upsertPipeline = async (
  pipeline: Prisma.PipelineUncheckedCreateInput,
) => {
  const response = await db.pipeline.upsert({
    where: { id: pipeline.id || v4() },
    update: pipeline,
    create: pipeline,
  })

  return response
}

export const deletePipeline = async (pipelineId: string) => {
  const response = await db.pipeline.delete({
    where: { id: pipelineId },
  })
  return response
}

export const updateLanesOrder = async (lanes: Lane[]) => {
  try {
    const updateTrans = lanes.map((lane) =>
      db.lane.update({
        where: {
          id: lane.id,
        },
        data: {
          order: lane.order,
        },
      }),
    )

    await db.$transaction(updateTrans)
    console.log('🟢 Done reordered 🟢')
  } catch (error) {
    console.log(error, 'ERROR UPDATE LANES ORDER')
  }
}

export const updateTicketsOrder = async (tickets: Ticket[]) => {
  try {
    const updateTrans = tickets.map((ticket) =>
      db.ticket.update({
        where: {
          id: ticket.id,
        },
        data: {
          order: ticket.order,
          laneId: ticket.laneId,
        },
      }),
    )

    await db.$transaction(updateTrans)
    console.log('🟢 Done reordered 🟢')
  } catch (error) {
    console.log(error, '🔴 ERROR UPDATE TICKET ORDER')
  }
}

export const upsertLane = async (lane: Prisma.LaneUncheckedCreateInput) => {
  let order: number

  if (!lane.order) {
    const lanes = await db.lane.findMany({
      where: {
        pipelineId: lane.pipelineId,
      },
    })

    order = lanes.length
  } else {
    order = lane.order
  }

  const response = await db.lane.upsert({
    where: { id: lane.id || v4() },
    update: lane,
    create: { ...lane, order },
  })

  return response
}

export const deleteLane = async (laneId: string) => {
  const response = await db.lane.delete({ where: { id: laneId } })
  return response
}

export const getTicketsWithTags = async (pipelineId: string) => {
  const response = await db.ticket.findMany({
    where: {
      Lane: {
        pipelineId,
      },
    },
    include: { Tags: true, Assigned: true, Customer: true },
  })
  return response
}

export const _getTicketsWithAllRelations = async (laneId: string) => {
  const response = await db.ticket.findMany({
    where: { laneId: laneId },
    include: {
      Assigned: true,
      Customer: true,
      Lane: true,
      Tags: true,
    },
  })
  return response
}

export const getSubAccountTeamMembers = async (subaccountId: string) => {
  const subaccountUsersWithAccess = await db.user.findMany({
    where: {
      Organisation: {
        SubAccount: {
          some: {
            id: subaccountId,
          },
        },
      },
      role: 'SUBACCOUNT_USER',
      Permissions: {
        some: {
          subAccountId: subaccountId,
          access: true,
        },
      },
    },
  })
  return subaccountUsersWithAccess
}

export const searchContacts = async (searchTerms: string) => {
  const response = await db.contact.findMany({
    where: {
      name: {
        contains: searchTerms,
      },
    },
  })
  return response
}

export const upsertTicket = async (
  ticket: Prisma.TicketUncheckedCreateInput,
  tags: Tag[],
) => {
  let order: number
  if (!ticket.order) {
    const tickets = await db.ticket.findMany({
      where: { laneId: ticket.laneId },
    })
    order = tickets.length
  } else {
    order = ticket.order
  }

  const response = await db.ticket.upsert({
    where: {
      id: ticket.id || v4(),
    },
    update: { ...ticket, Tags: { set: tags } },
    create: { ...ticket, Tags: { connect: tags }, order },
    include: {
      Assigned: true,
      Customer: true,
      Tags: true,
      Lane: true,
    },
  })

  return response
}

export const deleteTicket = async (ticketId: string) => {
  const response = await db.ticket.delete({
    where: {
      id: ticketId,
    },
  })

  return response
}

export const upsertTag = async (
  subaccountId: string,
  tag: Prisma.TagUncheckedCreateInput,
) => {
  const response = await db.tag.upsert({
    where: { id: tag.id || v4(), subAccountId: subaccountId },
    update: tag,
    create: { ...tag, subAccountId: subaccountId },
  })

  return response
}

export const getTagsForSubaccount = async (subaccountId: string) => {
  const response = await db.subAccount.findUnique({
    where: { id: subaccountId },
    select: { Tags: true },
  })
  return response
}

export const deleteTag = async (tagId: string) => {
  const response = await db.tag.delete({ where: { id: tagId } })
  return response
}

export const upsertContact = async (
  contact: Prisma.ContactUncheckedCreateInput,
) => {
  const response = await db.contact.upsert({
    where: { id: contact.id || v4() },
    update: contact,
    create: contact,
  })
  return response
}

export const getFunnels = async (subaccountId: string) => {
  const funnels = await db.funnel.findMany({
    where: { subAccountId: subaccountId },
    include: { FunnelPages: true },
  })

  return funnels
}

export const getFunnel = async (funnelId: string) => {
  const funnel = await db.funnel.findUnique({
    where: { id: funnelId },
    include: {
      FunnelPages: {
        orderBy: {
          order: 'asc',
        },
      },
    },
  })

  return funnel
}

export const updateFunnelProducts = async (
  products: string,
  funnelId: string,
) => {
  const data = await db.funnel.update({
    where: { id: funnelId },
    data: { liveProducts: products },
  })
  return data
}


// export const updateFunnelProducts = async (
//   products: string,
//   funnelId: string,
// ) => {
//   try {
//     // Vérification de l'existence du funnel
//     const existingFunnel = await db.funnel.findUnique({
//       where: { id: funnelId },
//     });

//     if (!existingFunnel) {
//       throw new Error(`Funnel with ID ${funnelId} not found.`);
//     }

//     // Mise à jour des produits associés au funnel
//     const updatedFunnel = await db.funnel.update({
//       where: { id: funnelId },
//       data: { liveProducts: products },
//     });

//     return updatedFunnel;
//   } catch (error) {
//     console.error('Error updating funnel products:', error);
//     throw new Error('Could not update funnel products.');
//   }
// }

export const upsertFunnelPage = async (
  subaccountId: string,
  funnelPage: Prisma.FunnelPageUncheckedCreateInput,
  funnelId: string,
) => {
  if (!subaccountId || !funnelId) return
  const response = await db.funnelPage.upsert({
    where: { id: funnelPage.id || v4() },
    update: { ...funnelPage },
    create: {
      ...funnelPage,
      content: funnelPage.content
        ? funnelPage.content
        : JSON.stringify([
            {
              content: [],
              id: '__body',
              name: 'Body',
              styles: { backgroundColor: 'white' },
              type: '__body',
            },
          ]),
      funnelId,
    },
  })

  return response
}

export const deleteFunnelPage = async (funnelPageId: string) => {
  const response = await db.funnelPage.delete({ where: { id: funnelPageId } })

  return response
}

export const getFunnelPageDetails = async (funnelPageId: string) => {
  const response = await db.funnelPage.findUnique({
    where: {
      id: funnelPageId,
    },
  })

  return response
}

export const getDomainContent = async (subDomainName: string) => {
  const response = await db.funnel.findUnique({
    where: {
      subDomainName,
    },
    include: { FunnelPages: true },
  })
  return response
}

export const getPipelines = async (subaccountId: string) => {
  const response = await db.pipeline.findMany({
    where: { subAccountId: subaccountId },
    include: {
      Lane: {
        include: { Tickets: true },
      },
    },
  })
  return response
}
