import { getAuthUserDetails } from '@/lib/queries';
import React from 'react';
import MenuOptions from './menu-options';

type Props = {
  id: string;
  type: 'organisation' | 'subaccount';
};

const Sidebar = async ({ id, type }: Props) => {
  const user = await getAuthUserDetails();
  if (!user) {
    console.log('User not found');
    return null;
  }

  console.log('User:', user);
  console.log('Organisation:', user.Organisation);

  if (!user.Organisation) {
    console.log('Organisation not found');
    return null;
  }

  // Recherche du sous-compte par ID
  const details =
    type === 'organisation'
      ? user.Organisation
      : user.Organisation.SubAccount.find((subaccount) => {
          console.log('Checking subaccount ID:', subaccount.id, 'against ID:', id);
          return subaccount.id === id;
        });

  if (!details) {
    console.log('Details for subaccount not found, ID:', id);
    return null;
  }

  console.log('Details:', details);

  const isWhiteLabeledOrganisation = user.Organisation.whiteLabel;

  let sideBarLogo = user.Organisation.organisationLogo || '/assets/fllux.svg';

  if (!isWhiteLabeledOrganisation) {
    if (type === 'subaccount') {
      const foundSubAccount = user.Organisation.SubAccount.find(
        (subaccount) => subaccount.id === id
      );
      if (foundSubAccount) {
        sideBarLogo = foundSubAccount.subAccountLogo || sideBarLogo;
      }
    }
  }

  console.log('Sidebar Logo:', sideBarLogo);

  const sidebarOpt =
    type === 'organisation'
      ? user.Organisation.SidebarOption || []
      : user.Organisation.SubAccount.find((subaccount) => subaccount.id === id)
          ?.SidebarOption || [];

  console.log('Sidebar Options:', sidebarOpt);

  const subaccounts = user.Organisation.SubAccount.filter((subaccount) =>
    user.Permissions.find(
      (permission) =>
        permission.subAccountId === subaccount.id && permission.access
    )
  );

  console.log('Subaccounts:', subaccounts);

  return (
    <>
      <MenuOptions
        defaultOpen={true}
        details={details}
        id={id}
        sidebarLogo={sideBarLogo}
        sidebarOpt={sidebarOpt}
        subAccounts={subaccounts}
        user={user}
      />
      <MenuOptions
        details={details}
        id={id}
        sidebarLogo={sideBarLogo}
        sidebarOpt={sidebarOpt}
        subAccounts={subaccounts}
        user={user}
      />
    </>
  );
};

export default Sidebar;
