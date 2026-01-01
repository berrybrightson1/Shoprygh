import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AdminRole = 'Owner Access' | 'Inventory Staff';

export interface AdminUser {
    name: string;
    role: AdminRole;
    gradient: string;
    initials: string;
    access: 'all' | 'inventory';
}

interface AdminState {
    currentUser: AdminUser;
    setUser: (user: AdminUser) => void;
}

export const MOCK_USERS: AdminUser[] = [
    {
        name: "Mama Anaya",
        role: "Owner Access",
        gradient: "from-purple-500 to-pink-500",
        initials: "MA",
        access: "all"
    },
    {
        name: "Mike Stock",
        role: "Inventory Staff",
        gradient: "from-orange-500 to-yellow-400",
        initials: "MS",
        access: "inventory"
    }
];

export const useAdminStore = create<AdminState>()(
    persist(
        (set) => ({
            currentUser: MOCK_USERS[0],
            setUser: (user) => set({ currentUser: user }),
        }),
        {
            name: 'admin-storage',
        }
    )
);
