'use client'

import { useEffect } from 'react'
import { useCart } from '@/lib/cart-context'

export default function ClearCart() {
  const { dispatch } = useCart()

  useEffect(() => {
    dispatch({ type: 'CLEAR' })
  }, [dispatch])

  return null
}
