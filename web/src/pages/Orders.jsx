import React, { useEffect, useState } from 'react'
import { api } from '../api'

export default function Orders({ token }){
  const [orders, setOrders] = useState([])

  useEffect(()=>{ load() },[])
  async function load(){
    const r = await api('/orders','GET',undefined, token)
    setOrders(r)
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-xl font-semibold mb-3">My Orders</h1>
      <div className="space-y-3">
        {orders.map(o=>(
          <div key={o.id} className="bg-white p-4 rounded border">
            <div className="flex justify-between">
              <div>Order #{o.id}</div>
              <div className="font-bold">${Number(o.total).toFixed(2)}</div>
            </div>
            <div className="text-sm text-gray-600">Status: {o.status}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
