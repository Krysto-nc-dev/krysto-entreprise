'use client';
import { useModal } from '@/providers/modal-provider';
import React from 'react';
import { Button } from '../ui/button';
import CustomModal from '../global/customModal';
import UploadMediaForm from '../forms/uploadMedia';

type Props = {
  subaccountId: string;
};

const MediaUploadButton = ({ subaccountId }: Props) => {
  const { isOpen, setOpen, setClose } = useModal();

  return (
    <Button
      onClick={() => {
        setOpen(
          <CustomModal
            title="Téléverser un média"
            subheading="Téléversez un fichier dans votre espace de stockage de médias"
          >
            <UploadMediaForm subaccountId={subaccountId}></UploadMediaForm>
          </CustomModal>
        );
      }}
    >
      Téléverser
    </Button>
  );
};

export default MediaUploadButton;
