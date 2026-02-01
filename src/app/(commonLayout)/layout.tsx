import { Navbar } from '@/components/layout/navbar1';
import React from 'react';

const CommonLayout = ({children}:{children:React.ReactNode}) => {
    return (
        <div>
            <Navbar />
            {children}
        </div>
    );
};

export default CommonLayout;