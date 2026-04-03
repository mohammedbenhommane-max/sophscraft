'use client'

import { useEffect } from 'react'
import { useCart } from '@/lib/cart-context'

export default function ClearCart() {
  const { dispatch } = useCart()

  useEffect(() => {
    localStorage.removeItem('sophscraft-cart')
    dispatch({ type: 'CLEAR' })
  }, [dispatch])

  return null
}
