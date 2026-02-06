import { Navbar } from '@/components/layout/navbar1';
import { CartProvider } from '@/contexts/cart-context';
import React from 'react';

const CommonLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div>
            <CartProvider>
                <Navbar />
                {children}
            </CartProvider>

        </div>
    );
};

export default CommonLayout;