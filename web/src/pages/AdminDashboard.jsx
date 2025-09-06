import React, { useEffect, useState } from 'react'
import { api } from '../api'

export default function AdminDashboard({ token }){
  const [meds, setMeds] = useState([])
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [form, setForm] = useState({ name:'', description:'', price:'', stock:'' })
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [msgType, setMsgType] = useState('success') // 'success' or 'error'

  // Auto-clear messages after 5 seconds
  useEffect(() => {
    if (msg) {
      const timer = setTimeout(() => setMsg(''), 5000)
      return () => clearTimeout(timer)
    }
  }, [msg])

  async function loadMeds(){
    const r = await api('/catalog/medicines')
    setMeds(r)
  }
  
  async function loadNotifications(){
    try {
      const r = await api('/notify/notifications', 'GET', undefined, token)
      setNotifications(r)
      
      const countR = await api('/notify/notifications/unread/count', 'GET', undefined, token)
      setUnreadCount(countR.count)
    } catch (error) {
      console.error('Failed to load notifications:', error)
    }
  }

  useEffect(()=>{ loadMeds(); loadNotifications(); }, [])

  async function createMed(e){
    e.preventDefault()
    setLoading(true)
    setMsg('') // Clear previous messages
    try{
      const payload = { 
        name: form.name.trim(),
        description: form.description || '',
        price: Number(form.price),
        stock: Number(form.stock)
      }
      
      // Client-side validation for better UX
      if (!payload.name || payload.name.length < 2) {
        setMsg('Medicine name must be at least 2 characters long')
        setMsgType('error')
        setLoading(false)
        return
      }
      if (payload.price <= 0) {
        setMsg('Price must be greater than 0')
        setMsgType('error')
        setLoading(false)
        return
      }
      if (payload.stock < 0) {
        setMsg('Stock cannot be negative')
        setMsgType('error')
        setLoading(false)
        return
      }
      
      await api('/catalog/medicines','POST', payload, token)
      setForm({name:'',description:'',price:'',stock:''})
      setMsg('Medicine created successfully!')
      setMsgType('success')
      await loadMeds()
    }catch(err){ 
      setMsg(err.message)
      setMsgType('error')
    }
    setLoading(false)
  }

  async function deleteMed(id){
    if(!confirm('Delete this medicine?')) return
    await api(`/catalog/medicines/${id}`,'DELETE',undefined, token)
    await loadMeds()
  }

  async function markNotificationRead(notificationId) {
    try {
      await api(`/notify/notifications/${notificationId}/read`, 'PATCH', undefined, token)
      setNotifications(prev => prev.map(n => n.id === notificationId ? {...n, read: true} : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        {unreadCount > 0 && (
          <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm">
            {unreadCount} new notification{unreadCount !== 1 ? 's' : ''}
          </div>
        )}
      </div>
      
      {msg && (
        <div className={`p-3 rounded-lg border ${
          msgType === 'error' 
            ? 'bg-red-50 border-red-200 text-red-800' 
            : 'bg-green-50 border-green-200 text-green-800'
        }`}>
          <div className="flex items-center">
            {msgType === 'error' ? (
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
            {msg}
          </div>
        </div>
      )}

      {/* Notifications */}
      <section className="bg-white rounded-xl border p-4 shadow">
        <h2 className="text-xl font-semibold mb-3">Recent Notifications</h2>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No notifications yet</p>
          ) : (
            notifications.slice(0, 10).map(notification => (
              <div 
                key={notification.id} 
                className={`p-3 rounded border cursor-pointer transition-colors ${
                  notification.read 
                    ? 'bg-gray-50 border-gray-200' 
                    : 'bg-blue-50 border-blue-200'
                }`}
                onClick={() => !notification.read && markNotificationRead(notification.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${notification.read ? 'text-gray-700' : 'text-blue-700'}`}>
                        {notification.title}
                      </span>
                      {!notification.read && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded ${
                    notification.type === 'order' 
                      ? 'bg-green-100 text-green-700'
                      : 'bg-orange-100 text-orange-700'
                  }`}>
                    {notification.type}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

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
    </div>
  )
}
