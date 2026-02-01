import { Route } from "@/types";

export const sellerRoutes: Route[] = [
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
                title: "Overview",
                url: "/seller/dashboard",
                icon: "Home"
            }
        ],
    },
    {
        title: "Inventory",
        items: [
            {
                title: "Manage Medicines",
                url: "/seller/medicines",
                icon: "Package"
            },
            {
                title: "Add Medicine",
                url: "/seller/medicines/add",
                icon: "Plus"
            }
        ],
    },
    {
        title: "Orders",
        items: [
            {
                title: "View Orders",
                url: "/seller/orders",
                icon: "ShoppingBag"
            }
        ],
    }
];