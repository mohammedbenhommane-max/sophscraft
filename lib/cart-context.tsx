'use client'

import { createContext, useContext, useEffect, useReducer, ReactNode } from 'react'

export type CartItem = {
  id: string
  slug: string
  nameFR: string
  nameEN: string
  price: number
  image: string
  quantity: number
}

type CartState = {
  items: CartItem[]
  isOpen: boolean
}

type CartAction =
  | { type: 'ADD_ITEM'; item: Omit<CartItem, 'quantity'> }
  | { type: 'REMOVE_ITEM'; id: string }
  | { type: 'UPDATE_QUANTITY'; id: string; quantity: number }
  | { type: 'CLEAR' }
  | { type: 'OPEN' }
  | { type: 'CLOSE' }

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find((i) => i.id === action.item.id)
      if (existing) {
        return {
          ...state,
          isOpen: true,
          items: state.items.map((i) =>
            i.id === action.item.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        }
      }
      return {
        ...state,
        isOpen: true,
        items: [...state.items, { ...action.item, quantity: 1 }],
      }
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((i) => i.id !== action.id) }
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.id ? { ...i, quantity: action.quantity } : i
        ),
      }
    case 'CLEAR':
      return { ...state, items: [] }
    case 'OPEN':
      return { ...state, isOpen: true }
    case 'CLOSE':
      return { ...state, isOpen: false }
    default:
      return state
  }
}

const CartContext = createContext<{
  state: CartState
  dispatch: React.Dispatch<CartAction>
  itemCount: number
  subtotal: number
} | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], isOpen: false })

  // Restore from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sophscraft-cart')
      if (saved) {
        const items: CartItem[] = JSON.parse(saved)
        if (Array.isArray(items) && items.length > 0) {
          items.forEach((item) => dispatch({ type: 'ADD_ITEM', item }))
        }
      }
    } catch {
      localStorage.removeItem('sophscraft-cart')
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('sophscraft-cart', JSON.stringify(state.items))
  }, [state.items])

  const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0)
  const subtotal = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <CartContext.Provider value={{ state, dispatch, itemCount, subtotal }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
