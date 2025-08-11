import React, { useEffect, useState } from 'react'
import { api } from '../api'

export default function Catalog({ addToCart }){
  const [list, setList] = useState([])
  const [q, setQ] = useState('')

  useEffect(()=>{ load() },[])

  async function load(){
    const r = await api(`/catalog/medicines${q?`?search=${encodeURIComponent(q)}`:''}`)
    setList(r)
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex gap-2 mb-4">
        <input className="border rounded px-3 py-2 flex-1" placeholder="Search..." value={q} onChange={e=>setQ(e.target.value)} />
        <button onClick={load} className="bg-blue-600 text-white px-4 py-2 rounded">Search</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {list.map(m=>(
          <div key={m.id} className="bg-white rounded-xl border p-4 shadow">
            <div className="font-semibold">{m.name}</div>
            <div className="text-sm text-gray-600">{m.description}</div>
            <div className="mt-2 font-bold">${Number(m.price).toFixed(2)}</div>
            <button onClick={()=>addToCart(m)} className="mt-3 bg-green-600 text-white px-3 py-1 rounded">Add to cart</button>
          </div>
        ))}
      </div>
    </div>
  )
}
