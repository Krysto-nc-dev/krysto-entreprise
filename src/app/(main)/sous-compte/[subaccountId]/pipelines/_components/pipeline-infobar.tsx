// import CreatePipelineForm from '@/components/forms/create-pipeline-form';
// import CustomModal from '@/components/global/customModal';
// import { Button } from '@/components/ui/button';
// import {
//   Command,
//   CommandEmpty,
//   CommandGroup,
//   CommandItem,
// } from '@/components/ui/command';
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from '@/components/ui/popover';
// import { cn } from '@/lib/utils';
// import { useModal } from '@/providers/modal-provider';
// import { Pipeline } from '@prisma/client';
// import { Check, ChevronsUpDown, Plus } from 'lucide-react';
// import Link from 'next/link';
// import React from 'react';

// type Props = {
//   subAccountId: string;
//   pipelines: Pipeline[];
//   pipelineId: string;
// };

// const PipelineInfoBar = ({ pipelineId, pipelines = [], subAccountId }: Props) => {
  
 
//   const { setOpen: setOpenModal, setClose } = useModal();
//   const [open, setOpenPopover] = React.useState(false);
//   const [value, setValue] = React.useState(pipelineId);


//   const handleClickCreatePipeline = () => {
//     setOpenModal(
//       <CustomModal
//         title="Créer un Kanban"
//         subheading="Les kanbans vous permettent de regrouper des tickets en colonnes et de suivre vos processus métier en un seul endroit."
//       >
//         <CreatePipelineForm subAccountId={subAccountId} />
//       </CustomModal>
//     );
//   };

//   return (
//     <div>
//       <div className="flex items-end gap-2">
//         <Popover
//           open={open}
//           onOpenChange={setOpenPopover}
//         >
//           <PopoverTrigger asChild>
//             <Button
//               variant="outline"
//               role="combobox"
//               aria-expanded={open}
//               className="w-[200px] justify-between"
//             >
//               {value
//                 ? pipelinesToRender.find((pipeline) => pipeline.id === value)?.name || 'Sélectionnez un Kanban...'
//                 : 'Sélectionnez un Kanban...'}
//               <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
//             </Button>
//           </PopoverTrigger>
//           <PopoverContent className="w-[200px] p-0">
//             <Command>
//               <CommandEmpty>Aucun Kanban trouvé.</CommandEmpty>
//               <CommandGroup>
//                 {pipelinesToRender.length > 0 ? (
//                   pipelinesToRender.map((pipeline) => (
//                     <Link
//                       key={pipeline.id}
//                       href={`/sous-compte/${subAccountId}/pipelines/${pipeline.id}`}
//                     >
//                       <CommandItem
//                         onSelect={() => {
//                           setValue(pipeline.id);
//                           setOpenPopover(false);
//                         }}
//                       >
//                         <Check
//                           className={cn(
//                             'mr-2 h-4 w-4',
//                             value === pipeline.id ? 'opacity-100' : 'opacity-0'
//                           )}
//                         />
//                         {pipeline.name || 'Nom du Kanban manquant'}
//                       </CommandItem>
//                     </Link>
//                   ))
//                 ) : (
//                   <CommandEmpty>Aucun Kanban trouvé.</CommandEmpty>
//                 )}
//                 <Button
//                   variant="secondary"
//                   className="flex gap-2 w-full mt-4"
//                   onClick={handleClickCreatePipeline}
//                 >
//                   <Plus size={15} />
//                   Créer un Kanban
//                 </Button>
//               </CommandGroup>
//             </Command>
//           </PopoverContent>
//         </Popover>
//       </div>
//     </div>
//   );
// };

// export default PipelineInfoBar;


'use client'
import React, { useState } from 'react';
import CreatePipelineForm from '@/components/forms/create-pipeline-form';
import CustomModal from '@/components/global/custommodal';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Pipeline } from '@prisma/client';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import Link from 'next/link';

type Props = {
  subAccountId: string;
  pipelines: Pipeline[];
  pipelineId: string;
};

const PipelineInfoBar = ({ pipelineId, pipelines = [], subAccountId }: Props) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [open, setOpenPopover] = useState(false);
  const [value, setValue] = useState(pipelineId);

  const handleClickCreatePipeline = () => {
    setModalOpen(true);
  };

  return (
    <div>
      <div className="flex items-end gap-2">
        <Popover
          open={open}
          onOpenChange={setOpenPopover}
        >
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-[200px] justify-between"
            >
              {value
                ? pipelines.find((pipeline) => pipeline.id === value)?.name || 'Sélectionnez un Kanban...'
                : 'Sélectionnez un Kanban...'}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandEmpty>Aucun Kanban trouvé.</CommandEmpty>
              <CommandGroup>
                {pipelines.length > 0 ? (
                  pipelines.map((pipeline) => (
                    <Link
                      key={pipeline.id}
                      href={`/sous-compte/${subAccountId}/pipelines/${pipeline.id}`}
                    >
                      <CommandItem
                        onSelect={() => {
                          setValue(pipeline.id);
                          setOpenPopover(false);
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            value === pipeline.id ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        {pipeline.name || 'Nom du Kanban manquant'}
                      </CommandItem>
                    </Link>
                  ))
                ) : (
                  <CommandEmpty>Aucun Kanban trouvé.</CommandEmpty>
                )}
                <Button
                  variant="secondary"
                  className="flex gap-2 w-full mt-4"
                  onClick={handleClickCreatePipeline}
                >
                  <Plus size={15} />
                  Créer un Kanban
                </Button>
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      {modalOpen && (
        <CustomModal
          title="Créer un Kanban"
          subheading="Les kanbans vous permettent de regrouper des tickets en colonnes et de suivre vos processus métier en un seul endroit."
          onClose={() => setModalOpen(false)}
        >
          <CreatePipelineForm subAccountId={subAccountId} />
        </CustomModal>
      )}
    </div>
  );
};

export default PipelineInfoBar;


