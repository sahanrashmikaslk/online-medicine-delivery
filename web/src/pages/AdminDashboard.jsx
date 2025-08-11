import React, { useEffect, useState } from 'react'
import { api } from '../api'

const STATUSES = ['PENDING','DISPATCHED','IN_TRANSIT','DELIVERED','FAILED']

export default function AdminDashboard({ token }){
  const [meds, setMeds] = useState([])
  const [orders, setOrders] = useState([])
  const [form, setForm] = useState({ name:'', description:'', price:'', stock:'' })
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  async function loadMeds(){
    const r = await api('/catalog/medicines')
    setMeds(r)
  }
  async function loadOrders(){
    const r = await api('/orders/all', 'GET', undefined, token)
    setOrders(r)
  }

  useEffect(()=>{ loadMeds(); loadOrders(); }, [])

  async function createMed(e){
    e.preventDefault()
    setLoading(true)
    try{
      const payload = { 
        name: form.name.trim(),
        description: form.description || '',
        price: Number(form.price),
        stock: Number(form.stock)
      }
      await api('/catalog/medicines','POST', payload, token)
      setForm({name:'',description:'',price:'',stock:''})
      setMsg('Medicine created')
      await loadMeds()
    }catch(err){ setMsg('Create failed: ' + err.message) }
    setLoading(false)
  }

  async function deleteMed(id){
    if(!confirm('Delete this medicine?')) return
    await api(`/catalog/medicines/${id}`,'DELETE',undefined, token)
    await loadMeds()
  }

  async function updateDelivery(orderId, status){
    await api(`/delivery/${orderId}`,'PATCH',{ status }, token)
    setMsg(`Order ${orderId} -> ${status}`)
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-8">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      {msg && <div className="p-2 bg-green-100 border border-green-300 rounded">{msg}</div>}

      {/* Medicines */}
      <section className="bg-white rounded-xl border p-4 shadow">
        <h2 className="text-xl font-semibold mb-3">Manage Medicines</h2>
        <form onSubmit={createMed} className="grid md:grid-cols-4 gap-2 mb-4">
          <input className="border rounded px-3 py-2" placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
          <input className="border rounded px-3 py-2" placeholder="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} />
          <input className="border rounded px-3 py-2" type="number" step="0.01" placeholder="Price" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} />
          <input className="border rounded px-3 py-2" type="number" placeholder="Stock" value={form.stock} onChange={e=>setForm({...form,stock:e.target.value})} />
          <button disabled={loading} className="md:col-span-4 bg-blue-600 text-white px-3 py-2 rounded">{loading?'Saving...':'Add Medicine'}</button>
        </form>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="p-2">ID</th>
                <th className="p-2">Name</th>
                <th className="p-2">Price</th>
                <th className="p-2">Stock</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {meds.map(m=>(
                <tr key={m.id} className="border-b">
                  <td className="p-2">{m.id}</td>
                  <td className="p-2">{m.name}</td>
                  <td className="p-2">${Number(m.price).toFixed(2)}</td>
                  <td className="p-2">{m.stock}</td>
                  <td className="p-2">
                    <button onClick={()=>deleteMed(m.id)} className="text-red-600 underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Orders */}
      <section className="bg-white rounded-xl border p-4 shadow">
        <h2 className="text-xl font-semibold mb-3">All Orders</h2>
        <div className="space-y-3">
          {orders.map(o=>(
            <div key={o.id} className="p-3 border rounded flex items-center justify-between">
              <div>
                <div className="font-semibold">Order #{o.id}</div>
                <div className="text-gray-600 text-sm">User: {o.user_id} • Total: ${Number(o.total).toFixed(2)} • Status: {o.status}</div>
              </div>
              <div className="flex items-center gap-2">
                <select className="border rounded px-2 py-1" onChange={(e)=>updateDelivery(o.id, e.target.value)} defaultValue="">
                  <option value="" disabled>Set delivery status</option>
                  {STATUSES.map(s=> <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
