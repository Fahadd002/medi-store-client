import { Route } from "@/types";

export const adminRoutes: Route[] = [
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
        title: "User Management",
        items: [
            {
                title: "All Users",
                url: "/admin-dashboard/users",
                icon: "Users"
            }
        ],
    },
    {
        title: "Medicine Management",
        items: [
            {
                title: "All Medicines",
                url: "/admin-dashboard/medicines",
                icon: "Package"
            },
            {
                title: "Categories",
                url: "/admin-dashboard/categories",
                icon: "FolderTree"
            }
        ],
    },
    {
        title: "Order Management",
        items: [
            {
                title: "All Orders",
                url: "/admin-dashboard/orders",
                icon: "ShoppingBag"
            }
        ],
    }
];