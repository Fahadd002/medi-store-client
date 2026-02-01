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
                url: "/orders",
                icon: "ShoppingBag"
            },
            {
                title: "Order Details",
                url: "/orders/:id",
                icon: "FileText"
            }
        ],
    },
    {
        title: "Shopping",
        items: [
            {
                title: "Cart",
                url: "/cart",
                icon: "ShoppingCart"
            },
            {
                title: "Checkout",
                url: "/checkout",
                icon: "CreditCard"
            }
        ],
    }
];