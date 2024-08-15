import {
  Contact,
  Lane,
  Notification,
  Prisma,
  Role,
  Tag,
  Ticket,
  User,
} from '@prisma/client'
import {
  _getTicketsWithAllRelations,
  getAuthUserDetails,
  getFunnels,
  getMedia,
  getPipelineDetails,
  getTicketsWithTags,
  getUserPermissions,
} from './queries'
import { db } from './db'
import { z } from 'zod'

// Importation de Stripe
import Stripe from 'stripe'

// Commentaire des types et des constantes liés à Stripe
// export type StripeCustomerType = {
//   email: string
//   name: string
//   shipping: ShippingInfo
//   address: Address
// }

// export type PricesList = Stripe.ApiList<Stripe.Price>

export type NotificationWithUser =
  | ({
      User: {
        id: string
        name: string
        avatarUrl: string
        email: string
        createdAt: Date
        updatedAt: Date
        role: Role
        organisationId: string | null
      }
    } & Notification)[]
  | undefined

export type UserWithPermissionsAndSubAccounts = Prisma.PromiseReturnType<
  typeof getUserPermissions
>

export const FunnelPageSchema = z.object({
  name: z.string().min(1),
  pathName: z.string().optional(),
})

const __getUsersWithOrganisationSubAccountPermissionsSidebarOptions = async (
  organisationId: string
) => {
  return await db.user.findFirst({
    where: { Organisation: { id: organisationId } },
    include: {
      Organisation: { include: { SubAccount: true } },
      Permissions: { include: { SubAccount: true } },
    },
  })
}

export type AuthUserWithOrganisationSigebarOptionsSubAccounts =
  Prisma.PromiseReturnType<typeof getAuthUserDetails>

export type UsersWithOrganisationSubAccountPermissionsSidebarOptions =
  Prisma.PromiseReturnType<
    typeof __getUsersWithOrganisationSubAccountPermissionsSidebarOptions
  >

export type GetMediaFiles = Prisma.PromiseReturnType<typeof getMedia>

export type CreateMediaType = Prisma.MediaCreateWithoutSubaccountInput

export type TicketAndTags = Ticket & {
  Tags: Tag[]
  Assigned: User | null
  Customer: Contact | null
}

export type LaneDetail = Lane & {
  Tickets: TicketAndTags[]
}

export const CreatePipelineFormSchema = z.object({
  name: z.string().min(1),
})

export const CreateFunnelFormSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  subDomainName: z.string().optional(),
  favicon: z.string().optional(),
})

export type PipelineDetailsWithLanesCardsTagsTickets = Prisma.PromiseReturnType<
  typeof getPipelineDetails
>

export const LaneFormSchema = z.object({
  name: z.string().min(1),
})

export type TicketWithTags = Prisma.PromiseReturnType<typeof getTicketsWithTags>

const currencyNumberRegex = /^\d+(\.\d{1,2})?$/

export const TicketFormSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  value: z.string().refine((value) => currencyNumberRegex.test(value), {
    message: 'La valeur doit être un prix valide.',
  }),
})

export type TicketDetails = Prisma.PromiseReturnType<
  typeof _getTicketsWithAllRelations
>

export const ContactUserFormSchema = z.object({
  name: z.string().min(1, 'Requis'),
  email: z.string().email(),
})

export type Address = {
  city: string
  country: string
  line1: string
  postal_code: string
  state: string
}

export type ShippingInfo = {
  address: Address
  name: string
}

// Commentaire du type lié à Stripe
// export type StripeCustomerType = {
//   email: string
//   name: string
//   shipping: ShippingInfo
//   address: Address
// }

// Commentaire du type lié aux prix Stripe
// export type PricesList = Stripe.ApiList<Stripe.Price>

export type FunnelsForSubAccount = Prisma.PromiseReturnType<
  typeof getFunnels
>[0]

export type UpsertFunnelPage = Prisma.FunnelPageCreateWithoutFunnelInput
