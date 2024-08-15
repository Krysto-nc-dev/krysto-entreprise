'use client'

import { SubAccount } from '@prisma/client'
import React, { useMemo, useState, useEffect } from 'react'
import { Sheet, SheetClose, SheetContent, SheetTrigger } from '../ui/sheet'
import { Button } from '../ui/button'
import { Puzzle } from 'lucide-react';
import {
  Organisation,
  OrganisationSidebarOption,
  SubAccountSidebarOption,
} from '@prisma/client'
import { ChevronsUpDown, Compass, Menu, PlusCircle } from 'lucide-react'
import clsx from 'clsx'
import { AspectRatio } from '../ui/aspect-ratio'
import Image from 'next/image'
import { PopoverTrigger, Popover, PopoverContent } from '../ui/popover'
import { Separator } from '../ui/separator'
import { icons } from '../../lib/constants'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../ui/command'
import Link from 'next/link'
import { useModal } from '@/providers/modal-provider'
import CustomModal from '../global/customModal'
import SubAccountDetails from '../forms/subaccountDetails'

type Props = {
  defaultOpen?: boolean
  subAccounts: SubAccount[]
  sidebarOpt: OrganisationSidebarOption[] | SubAccountSidebarOption[]
  sidebarLogo: string
  details: any
  user: any
  id: string
}

const MenuOptions = ({
  defaultOpen,
  subAccounts,
  sidebarLogo,
  sidebarOpt,
  details,
  user,
  id,
}: Props) => {
  const { setOpen } = useModal()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const openState = useMemo(() => (defaultOpen ? { open: true } : {}), [
    defaultOpen,
  ])

  if (!isMounted) return null

  return (
    <Sheet modal={false} {...openState}>
      <SheetTrigger
        asChild
        className="absolute left-4 top-4 z-[100] md:hidden flex"
      >
       
        <Button variant="outline" size="icon">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent
        showX={!defaultOpen}
        side="left"
        className={clsx(
          'bg-background/80 backdrop-blur-xl fixed top-0 border-r-[1px] p-6',
          {
            'hidden md:inline-block z-0 w-[300px]': defaultOpen,
            'inline-block md:hidden z-[100] w-full': !defaultOpen,
          },
        )}
      >
        <div>
          <AspectRatio ratio={16 / 3}>
            <Image
              src={sidebarLogo}
              alt="logo organisation"
              className="rounded-md object-contain"
              fill
            />
          </AspectRatio>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className="w-full my-4 flex items-center justify-between py-8"
              >
                <div className="flex items-center text-left gap-2">
                  <Compass />
                  <div className="flex flex-col">
                    {details.name}
                    <span className="text-muted-foreground text-sm">
                      {details.city}
                    </span>
                  </div>
                </div>
                <div>
                  <ChevronsUpDown size={16} className="text-muted-foreground" />
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 h-80 z-[200]">
              <Command className="rounded-lg">
                <CommandInput placeholder="Rechercher un compte..." />
                <CommandList className="pb-16">
                  <CommandEmpty>Aucun résultat trouvé</CommandEmpty>
                  {(user?.role === 'ORGANISATION_OWNER' ||
                    user?.role === 'ORGANISATION_ADMIN') &&
                    user?.Organisation && (
                      <CommandGroup heading="Organisation">
                        <CommandItem className="!bg-transparent my-2 text-primary border-[1px] border-border p-2 rounded-md hover:bg-muted cursor-pointer transition-all">
                          <Link
                            href={`/organisation/${user?.Organisation.id}`}
                            className="flex gap-4 w-full h-full"
                          >
                            <div className="relative w-16">
                              <Image
                                src={user?.Organisation?.organisationLogo}
                                alt="Logo organisation"
                                fill
                                className="object-contain rounded-md"
                              />
                            </div>
                            <div className="flex flex-col">
                              <span>{user?.Organisation?.name}</span>
                              <span className="text-muted-foreground text-sm">
                                {user?.Organisation?.city}
                              </span>
                            </div>
                          </Link>
                        </CommandItem>
                      </CommandGroup>
                    )}
                  <CommandGroup heading="Compte">
                    {!!subAccounts
                      ? subAccounts.map((subaccount) => (
                          <CommandItem key={subaccount.id}>
                            <Link
                              href={`/sous-compte/${subaccount.id}`}
                              className="flex gap-4 w-full h-full"
                            >
                              <div className="relative w-16">
                                <Image
                                  src={subaccount.subAccountLogo}
                                  alt="Logo sous-compte"
                                  fill
                                  className="object-contain rounded-md"
                                />
                              </div>
                              <div className="flex flex-col">
                                <span>{subaccount.name}</span>
                                <span className="text-muted-foreground text-sm">
                                  {subaccount.city}
                                </span>
                              </div>
                            </Link>
                          </CommandItem>
                        ))
                      : 'Aucun comptes'}
                  </CommandGroup>
                </CommandList>
                {(user?.role === 'ORGANISATION_OWNER' ||
                  user?.role === 'ORGANISATION_ADMIN') && (
                  <SheetClose>
                    <Button
                      className="w-full flex gap-2 mt-2"
                      onClick={() =>
                        setOpen(
                          <CustomModal
                            title="Créer un sous-compte"
                            subheading="Créer un sous-compte pour votre organisation"
                          >
                            <SubAccountDetails
                              organisationDetails={user?.Organisation as Organisation}
                              userId={user?.id as string}
                              userName={user?.name}
                            />
                          </CustomModal>,
                        )
                      }
                    >
                      <PlusCircle size={15} />
                      Créer un sous-compte
                    </Button>
                  </SheetClose>
                )}
              </Command>
            </PopoverContent>
          </Popover>
          <p className="text-muted-foreground text-xs mb-2">MENU</p>
          <Separator className="mb-4" />
          <nav className="relative">
            <Command className="rounded-lg overflow-visible bg-transparent">
              <CommandInput placeholder="Rechercher..." />
              <CommandList className="py-4 overflow-visible">
                <CommandEmpty>Aucun résultat trouvé</CommandEmpty>
                <CommandGroup className="overflow-visible">
                  {sidebarOpt.map((sidebarOptions) => {
                    let val
                    const result = icons.find(
                      (icon) => icon.value === sidebarOptions.icon,
                    )

                    if (result) {
                      val = <result.path />
                    }

                    return (
                      <CommandItem
                        key={sidebarOptions.id}
                        className="group md:w-[320px] w-full text-sm bg-tansparent p-0"
                      >
                        <Link
                          href={sidebarOptions.link}
                          className="flex items-center py-1 px-2 gap-2 rounded-md transition-all mw-full w-[320px] group-hover:bg-primary"
                        >
                          {val}
                          <span className="text-xs">{sidebarOptions.name}</span>
                        </Link>
                      </CommandItem>
                    )
                  })}

<CommandItem
                       
                        className="group md:w-[320px] w-full text-sm bg-tansparent p-0"
                      >
                        <Link
                          href={`/organisation/${details.id}/modules`}
                          className="flex items-center py-1 px-2 gap-2 rounded-md transition-all mw-full w-[320px] group-hover:bg-primary"
                        >
                        <Puzzle />
                          <span className="text-xs">Modules</span>
                        </Link>
                      </CommandItem>
            
                </CommandGroup>
              </CommandList>
            </Command>
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default MenuOptions
