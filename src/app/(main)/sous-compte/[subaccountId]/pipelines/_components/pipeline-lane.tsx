'use client'
import CreateLaneForm from '@/components/forms/lane-form'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { deleteLane, saveActivityLogsNotification } from '@/lib/queries'
import { LaneDetail, TicketWithTags } from '@/lib/types'
import { cn } from '@/lib/utils'
import { useModal } from '@/providers/modal-provider'
import { Draggable, Droppable } from 'react-beautiful-dnd'
import { Edit, MoreVertical, PlusCircleIcon, Trash } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { Dispatch, SetStateAction, useMemo } from 'react'

import CustomModal from '@/components/global/customModal'
import TicketForm from '@/components/forms/ticket-form'
import PipelineTicket from './pipeline-tickets'

interface PipelaneLaneProps {
  setAllTickets: Dispatch<SetStateAction<TicketWithTags>>
  allTickets: TicketWithTags
  tickets: TicketWithTags
  pipelineId: string
  laneDetails: LaneDetail
  subaccountId: string
  index: number
}

const PipelineLane: React.FC<PipelaneLaneProps> = ({
  setAllTickets,
  tickets,
  pipelineId,
  laneDetails,
  subaccountId,
  allTickets,
  index,
}) => {
  const { setOpen } = useModal()
  const router = useRouter()

  const amt = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'XPF',
  })

  const laneAmt = useMemo(() => {
    console.log(tickets)
    return tickets.reduce(
      (sum, ticket) => sum + (Number(ticket?.value) || 0),
      0
    )
  }, [tickets])

  const randomColor = `#${Math.random().toString(16).slice(2, 8)}`

  const addNewTicket = (ticket: TicketWithTags[0]) => {
    setAllTickets([...allTickets, ticket])
  }

  const handleCreateTicket = () => {
    setOpen(
      <CustomModal
        title="Créer un ticket"
        subheading="Les tickets sont un excellent moyen de suivre les tâches"
      >
        <TicketForm
          getNewTicket={addNewTicket}
          laneId={laneDetails.id}
          subaccountId={subaccountId}
        />
      </CustomModal>
    )
  }

  const handleEditLane = () => {
    setOpen(
      <CustomModal
        title="Modifier les détails de la colonne"
        subheading=""
      >
        <CreateLaneForm
          pipelineId={pipelineId}
          defaultData={laneDetails}
        />
      </CustomModal>
    )
  }

  const handleDeleteLane = async () => {
    try {
      const response = await deleteLane(laneDetails.id)
      await saveActivityLogsNotification({
        organisationId: undefined,
        description: `Colonne supprimée | ${response?.name}`,
        subAccountId:subaccountId,
      })
      router.refresh()
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <Draggable
      draggableId={laneDetails.id.toString()}
      index={index}
      key={laneDetails.id}
    >
      {(provided, snapshot) => {
        if (snapshot.isDragging) {
          //@ts-ignore
          const offset = { x: 300, y: 0 }
          //@ts-ignore
          const x = provided.draggableProps.style?.left - offset.x
          //@ts-ignore
          const y = provided.draggableProps.style?.top - offset.y
          //@ts-ignore
          provided.draggableProps.style = {
            ...provided.draggableProps.style,
            top: y,
            left: x,
          }
        }
        return (
          <div
            {...provided.draggableProps}
            ref={provided.innerRef}
            className="h-full"
          >
            <AlertDialog>
              <DropdownMenu>
              <div className="mr-2 bg-slate-200/30 dark:bg-primary/20  h-[700px] w-[300px] px-4 relative rounded-lg overflow-hidden flex-shrink-0 ">

                  <div
                    {...provided.dragHandleProps}
                    className=" h-14 backdrop-blur-lg dark:bg-background/40 bg-slate-200/60  absolute top-0 left-0 right-0 z-10 "
                  >
                    <div className="h-full flex items-center p-4 justify-between cursor-grab border-b-[1px] ">
                      {/* {laneDetails.order} */}
                      <div className="flex items-center w-full gap-2">
                        <div
                          className={cn('w-4 h-4 rounded-full')}
                          style={{ background: randomColor }}
                        />
                        <span className="font-bold text-sm">
                          {laneDetails.name}
                        </span>
                      </div>
                      <div className="flex items-center flex-row">
                        <Badge className="bg-white text-black">
                          {amt.format(laneAmt)}
                        </Badge>
                        <DropdownMenuTrigger>
                          <MoreVertical className="text-muted-foreground cursor-pointer" />
                        </DropdownMenuTrigger>
                      </div>
                    </div>
                  </div>

                  <Droppable
                    droppableId={laneDetails.id.toString()}
                    key={laneDetails.id}
                    type="ticket"
                  >
                    {(provided) => (
                      <div className=" max-h-[700px] overflow-hidden pt-12 ">
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="mt-2"
                        >
                          {tickets.map((ticket, index) => (
                            <PipelineTicket
                              allTickets={allTickets}
                              setAllTickets={setAllTickets}
                              subaccountId={subaccountId}
                              ticket={ticket}
                              key={ticket.id.toString()}
                              index={index}
                            />
                          ))}
                          {provided.placeholder}
                        </div>
                      </div>
                    )}
                  </Droppable>

                  <DropdownMenuContent>
                    <DropdownMenuLabel>Options</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <AlertDialogTrigger>
                      <DropdownMenuItem className="flex items-center gap-2">
                        <Trash size={15} />
                        Supprimer
                      </DropdownMenuItem>
                    </AlertDialogTrigger>

                    <DropdownMenuItem
                      className="flex items-center gap-2"
                      onClick={handleEditLane}
                    >
                      <Edit size={15} />
                      Modifier
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="flex items-center gap-2"
                      onClick={handleCreateTicket}
                    >
                      <PlusCircleIcon size={15} />
                      Créer un ticket
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </div>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Êtes-vous absolument sûr ?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Cette action est irréversible. Cela supprimera définitivement votre compte et retirera vos données de nos serveurs.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex items-center">
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive"
                      onClick={handleDeleteLane}
                    >
                      Continuer
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </DropdownMenu>
            </AlertDialog>
          </div>
        )
      }}
    </Draggable>
  )
}

export default PipelineLane
