import { GetMediaFiles } from '@/lib/types';
import MediaUploadButton from './upload-buttons';
import MediaCard from './mediaCard';
import BlurPage from '@/components/global/blurpage';
import { Command, CommandInput, CommandList, CommandEmpty, CommandItem, CommandGroup } from '../ui/command';
import React from 'react';

type Props = {
    data: GetMediaFiles;
    subaccountId: string;
};

const Page = ({ data, subaccountId }: Props) => {
  return (
    <div className="flex flex-col gap-4 h-full w-full">
        <div className="flex justify-between items-center">
            <h1 className="text-xl">Banque de médias</h1>
            <MediaUploadButton subaccountId={subaccountId} />
        </div>
        <Command className="bg-transparent">

            <CommandInput placeholder="Rechercher un fichier..." />
            <CommandList className="pb-40 max-h-full">
            <CommandGroup heading="Organisation">
                <CommandEmpty className="text-red-400 text-center mt-8">Aucun média pour le moment</CommandEmpty>
                <div className="flex felx-wrap gap-4 pt-4">
                    {data?.Media.map((file) => (<CommandItem key={file.id} className="p-0 mx-w-[300px] w-full rounded-lg !bg-transparent !font-medium !text-white">
                        <MediaCard file={file}/>
                    </CommandItem>))}
                </div>
            </CommandGroup>
            </CommandList>
        </Command>
    </div>
  );
};

export default Page;
