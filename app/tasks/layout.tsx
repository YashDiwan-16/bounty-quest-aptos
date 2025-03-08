import { WalletModal } from '@/components/AuthWalletModal'
import React from 'react'

const TaskLayout = ({ children }:
    { children: React.ReactNode }
) => {
    return (
        <div>
            <WalletModal />
            {children}
        </div>
    )

}

export default TaskLayout