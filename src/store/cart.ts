import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Product {
    id: string
    name: string
    priceRetail: number
    category: string
    image: string | null
}

interface CartItem extends Product {
    quantity: number
}

interface CartState {
    items: CartItem[]
    currentStoreId: string | null
    addItem: (product: Product, count?: number) => void
    removeItem: (productId: string) => void
    decreaseItem: (productId: string) => void
    clearCart: () => void
    setStoreId: (storeId: string) => void
    checkoutWhatsApp: () => void
    isOpen: boolean
    toggleCart: () => void
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            currentStoreId: null,
            isOpen: false,
            toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
            setStoreId: (storeId: string) => {
                const currentStoreId = get().currentStoreId;
                // If switching to a different store, clear the cart
                if (currentStoreId && currentStoreId !== storeId) {
                    set({ items: [], currentStoreId: storeId });
                } else {
                    set({ currentStoreId: storeId });
                }
            },
            addItem: (product, count = 1) => set((state) => {
                const existing = state.items.find(i => i.id === product.id)
                if (existing) {
                    return {
                        items: state.items.map(i =>
                            i.id === product.id ? { ...i, quantity: i.quantity + count } : i
                        )
                    }
                }
                return { items: [...state.items, { ...product, quantity: count }] }
            }),
            removeItem: (id) => set((state) => ({
                items: state.items.filter(i => i.id !== id)
            })),
            decreaseItem: (id: string) => set((state) => {
                const existing = state.items.find(i => i.id === id)
                if (!existing) return { items: state.items }

                if (existing.quantity === 1) {
                    return { items: state.items.filter(i => i.id !== id) }
                }

                return {
                    items: state.items.map(i =>
                        i.id === id ? { ...i, quantity: i.quantity - 1 } : i
                    )
                }
            }),
            clearCart: () => set({ items: [] }),
            checkoutWhatsApp: () => {
                const { items } = get()
                if (items.length === 0) return alert("Cart is empty")

                let msg = "Hello! I would like to order:%0A"
                msg += items.map(i => `${i.quantity}x ${i.name}`).join('%0A')

                const total = items.reduce((acc, i) => acc + (Number(i.priceRetail) * i.quantity), 0)
                msg += `%0A%0A*Total: ₵${total}*`

                // In production, this would be:
                window.open(`https://wa.me/233555555555?text=${msg}`, '_blank')
                console.log("Redirecting to WhatsApp with message:", msg)
                alert("Redirecting to WhatsApp...\n\n" + decodeURIComponent(msg))

                set({ items: [] })
            }
        }),
        {
            name: 'cart-storage',
            // Use partialize to create store-specific storage
            partialize: (state) => ({
                items: state.items,
                currentStoreId: state.currentStoreId,
            }),
        }
    )
)
