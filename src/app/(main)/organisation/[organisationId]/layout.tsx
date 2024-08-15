import BlurPage from '@/components/global/blurpage'
import InfoBar from '@/components/global/infobar'
import Sidebar from '@/components/sidebar'
import Unauthorized from '@/components/unauthorized'
import { getNotificationAndUser, verifyAndAcceptInvitation } from '@/lib/queries'

import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import React from 'react'

type Props = {
    children: React.ReactNode,
    params: { organisationId: string }
}

const Layout = async ({ children, params }: Props) => {
    const organisationId = await verifyAndAcceptInvitation()
    const user = await currentUser()
    console.log(user)
    
    if (!user) {
        return redirect('/')
    }
    if (!organisationId) {
        return redirect('/organisation')
    }
    if (user.privateMetadata.role !== "ORGANISATION_OWNER" && user.privateMetadata.role !== 'ORGANISATION_ADMIN') {
        return <Unauthorized />
    }

    let allNoti: any = []
    const notifications = await getNotificationAndUser(organisationId)
    if (notifications) allNoti = notifications

    return (
    
        <div className='h-screen overflow-hidden'>
            <Sidebar
                id={params.organisationId}
                type='organisation'
                />
            <div className='md:pl-[300px]'>
                <InfoBar notifications={allNoti} />
                <div className='relative'>
                    <BlurPage>
                        {children}
                    </BlurPage>
                </div>
            </div>
        </div>
                
    )
}

export default Layout
