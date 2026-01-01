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
    addItem: (product: Product) => void
    removeItem: (productId: string) => void
    decreaseItem: (productId: string) => void
    clearCart: () => void
    checkoutWhatsApp: () => void
    isOpen: boolean
    toggleCart: () => void
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            isOpen: false,
            toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
            addItem: (product) => set((state) => {
                const existing = state.items.find(i => i.id === product.id)
                if (existing) {
                    return {
                        items: state.items.map(i =>
                            i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
                        )
                    }
                }
                return { items: [...state.items, { ...product, quantity: 1 }] }
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

                let msg = "Hello Anaya's! I would like to order:%0A"
                items.forEach(item => {
                    msg += `- ${item.name} (${item.quantity}x) - ₵${item.priceRetail * item.quantity}%0A`
                })

                const total = items.reduce((sum, item) => sum + (item.priceRetail * item.quantity), 0)
                msg += `%0ATotal: ₵${total}`

                // In production, this would be:
                // window.open(`https://wa.me/...?text=${msg}`)
                console.log("Redirecting to WhatsApp with message:", msg)
                alert("Redirecting to WhatsApp...\n\n" + decodeURIComponent(msg))

                set({ items: [] })
            }
        }),
        {
            name: 'cart-storage',
        }
    )
)
