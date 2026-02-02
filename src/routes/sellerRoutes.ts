import { Route } from "@/types";

export const sellerRoutes: Route[] = [
    {
        title: "Main",
        items: [
            {
                title: "Home",
                url: "/",
                icon: "Home",
            },
        ],
    },
    {
        title: "Inventory",
        items: [
            {
                title: "Manage Medicines",
                url: "/seller-dashboard/medicines",
                icon: "Package",
            },
            {
                title: "Add Medicine",
                url: "/seller-dashboard/add-medicines",
                icon: "PlusCircle",
            },
        ],
    },
    {
        title: "Orders",
        items: [
            {
                title: "View Orders",
                url: "/seller-dashboard/orders",
                icon: "ShoppingBag",
            },
        ],
    },
];
