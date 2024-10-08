import {db} from '@/lib/db';
import {redirect} from 'next/navigation';
import React from 'react';

type Props = {
    params: { subaccountId: string };
};

const Pipelines =  async ({ params }: Props) => {

    const pipelineExists = await db.pipeline.findFirst({
        where: {subAccountId :params.subaccountId}
    })

    if(pipelineExists) {
        return redirect(
            `/sous-compte/${params.subaccountId}/pipelines/${pipelineExists.id}`
        )
    }

    try {
        const response = await db.pipeline.create({
            data: {name: "premier kanban", subAccountId: params.subaccountId}
        })

        return redirect(
            `/sous-compte/${params.subaccountId}/pipelines/${response.id}`
        )

    } catch(error) {
        console.log(error)
    }
 
};

export default Pipelines;
