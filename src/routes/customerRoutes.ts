import { Route } from "@/types";

export const customerRoutes: Route[] = [
    {
        title: "Main",
        items: [
            {
                title: "Home",
                url: "/",
                icon: "Home"
            }
        ],
    },
    {
        title: "Dashboard",
        items: [
            {
                title: "Profile",
                url: "/profile",
                icon: "User"
            }
        ],
    },
    {
        title: "Orders",
        items: [
            {
                title: "My Orders",
                url: "/dashboard/orders",
                icon: "ShoppingBag"
            }
        ],
    },
    {
        title: "Shopping",
        items: [
            {
                title: "Checkout",
                url: "/checkout",
                icon: "CreditCard"
            }
        ],
    }
];