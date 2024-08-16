'use client';

import { useEffect, useState } from 'react';
import { AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { getAuthUserDetails } from '@/lib/queries';
import { SubAccount } from '@prisma/client';
import Image from 'next/image';
import Link from 'next/link';
import { EditIcon, TrashIcon } from 'lucide-react';
import CustomModal from '@/components/global/custommodal';
import SubAccountDetails from '@/components/forms/subaccountdetails';
import { useModal } from '@/providers/modal-provider';
import DeleteButton from './_components/delete-bouton';

type Props = {
  params: { organisationId: string };
};

const AllSubAccountsPage: React.FC<Props> = ({ params }) => {
  const [user, setUser] = useState(null);
  const { setOpen } = useModal();

  useEffect(() => {
    const fetchUserDetails = async () => {
      const userData = await getAuthUserDetails();
      setUser(userData);
    };

    fetchUserDetails();
  }, []);

  if (!user) return null;

  const handleEditSubAccount = (subAccount: SubAccount) => {
    setOpen(
      <CustomModal
        title="Modifier le sous-compte"
        subheading={`Modifier les détails de ${subAccount.name}`}
      >
        <SubAccountDetails
          organisationDetails={user.Organisation as Organisation}
          details={subAccount}
          userId={user.id}
          userName={user.name}
        />
      </CustomModal>
    );
  };

  return (
    <AlertDialog>
      <div className="flex flex-col">
        <Command className="rounded-lg bg-transparent mt-3">
          <CommandInput placeholder="rechercher un compte..." />
          <CommandList>
            <CommandEmpty>Aucun résultat trouvé</CommandEmpty>
            <CommandGroup heading="Sous-comptes">
              {user.Organisation.SubAccount.length ? (
                user.Organisation.SubAccount.map((subAccount: SubAccount) => (
                  <CommandItem
                    className="h-32 !bg-background my-2 text-primary border-[1px] border-border p-4 rounded-lg hover:!bg-background cursor-pointer transition-all"
                    key={subAccount.id}
                  >
                    <Link
                      href={`/sousComptes/${subAccount.id}`}
                      className="flex gap-4 w-full h-full"
                    >
                      <div className="relative w-32">
                        <Image
                          src={subAccount.subAccountLogo}
                          alt="sous compte logo"
                          fill
                          className="rounded-md object-contain bg-muted/50 p-4"
                        />
                      </div>
                      <div className="flex flex-col justify-between">
                        <div className="flex flex-col">
                          {subAccount.name}
                          {/* <span className='text-muted-foreground text-xs'>{subAccount.address}</span> */}
                        </div>
                      </div>
                    </Link>

                    <div className="flex gap-2">
                      <AlertDialogTrigger asChild>
                        <Button
                          className="text-red-100 w-20 bg-red-600 hover:bg-red-900 hover:text-white mr-2"
                          size={'sm'}
                          variant={'destructive'}
                        >
                          <TrashIcon />
                        </Button>
                      </AlertDialogTrigger>

                      <Button
                        className="text-red-100 w-20 bg-orange-600 hover:bg-orange-900 hover:text-white"
                        size={'sm'}
                        variant={'destructive'}
                        onClick={() => handleEditSubAccount(subAccount)}
                      >
                        <EditIcon />
                      </Button>
                    </div>

                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-left">
                          Êtes-vous certain de vouloir supprimer ce sous-compte ?
                        </AlertDialogTitle>
                        <AlertDescription className="text-left">
                          Cette action est irréversible
                        </AlertDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="flex items-center">
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive hover:bg-destructive">
                          <DeleteButton subaccountId={subAccount.id} />
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </CommandItem>
                ))
              ) : (
                <div className="text-muted-foreground text-center p-4">
                  Aucun comptes
                </div>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </div>
    </AlertDialog>
  );
};

export default AllSubAccountsPage;
