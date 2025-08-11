import React from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'

export default function Cart({ cart, setCart, token }){
  const nav = useNavigate()
  const total = cart.reduce((s,i)=> s + i.price * i.qty, 0)

  const checkout = async ()=>{
    if (!token) return nav('/login')
    const items = cart.map(i=>({ medicine_id: i.id, quantity: i.qty }))
    await api('/orders','POST',{ items, address: '221B Baker Street, London'}, token)
    setCart([])
    nav('/orders')
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-xl font-semibold mb-3">Cart</h1>
      {cart.length===0 ? <div>Your cart is empty.</div> : (
        <div className="space-y-3">
          {cart.map((i,idx)=>(
            <div key={idx} className="flex justify-between bg-white p-3 rounded border">
              <div>{i.name} × {i.qty}</div>
              <div>${(i.price * i.qty).toFixed(2)}</div>
            </div>
          ))}
          <div className="flex justify-between font-bold">
            <div>Total</div><div>${total.toFixed(2)}</div>
          </div>
          <div className="flex gap-2">
            <button onClick={()=>setCart([])} className="px-3 py-2 border rounded">Clear</button>
            <button onClick={checkout} className="px-3 py-2 bg-blue-600 text-white rounded">Checkout</button>
          </div>
        </div>
      )}
    </div>
  )
}
