import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type LikedItem = {
    id: string;
    name: string;
    image: string | null;
    priceRetail: number;
    category: string;
};

interface LikesState {
    items: LikedItem[];
    toggleLike: (item: LikedItem) => void;
    isLiked: (id: string) => boolean;
}

export const useLikesStore = create<LikesState>()(
    persist(
        (set, get) => ({
            items: [],

            toggleLike: (newItem) => {
                const { items } = get();
                const exists = items.find(i => i.id === newItem.id);

                if (exists) {
                    // Remove
                    set({ items: items.filter(i => i.id !== newItem.id) });
                } else {
                    // Add
                    set({ items: [...items, newItem] });
                }
            },

            isLiked: (id) => {
                return get().items.some(item => item.id === id);
            }
        }),
        {
            name: 'anaya-likes-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
