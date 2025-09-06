import React, { useEffect, useState } from 'react'
import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Catalog from './pages/Catalog.jsx'
import Cart from './pages/Cart.jsx'
import Orders from './pages/Orders.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import Home from './pages/Home.jsx'
import { api } from './api'

export default function App(){
  const [token, setToken] = useState(localStorage.getItem('token')||'')
  const [user, setUser] = useState(null)
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('cart')||'[]'))
  const [loading, setLoading] = useState(true)

  useEffect(()=>{ localStorage.setItem('token', token||'') }, [token])
  useEffect(()=>{ localStorage.setItem('cart', JSON.stringify(cart)) }, [cart])

  // load user (role) whenever token changes
  useEffect(()=> {
    let ignore=false
    async function loadMe(){
      if(!token){ 
        setUser(null)
        setLoading(false)
        return
      }
      try{
        const me = await api('/auth/me','GET',undefined, token)
        if(!ignore) setUser(me)
      }catch(e){ 
        setUser(null)
        setToken('')
      }
      if(!ignore) setLoading(false)
    }
    loadMe()
    return ()=>{ ignore=true }
  }, [token])

  const addToCart = (m)=>{
    setCart(prev=>{
      const found = prev.find(x=>x.id===m.id)
      if (found){ found.qty += 1; return [...prev] }
      return [...prev, { ...m, qty:1 }]
    })
  }

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id))
  }

  const updateCartQuantity = (id, qty) => {
    if (qty <= 0) {
      removeFromCart(id)
      return
    }
    setCart(prev => prev.map(item => 
      item.id === id ? { ...item, qty } : item
    ))
  }

  const onLogout = ()=> { setToken(''); setUser(null) }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Navbar token={token} user={user} onLogout={onLogout} cartCount={cart.reduce((s,i)=>s+i.qty,0)} />
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={!token ? <Login setToken={setToken} /> : <Navigate to="/catalog" />} />
        <Route path="/register" element={!token ? <Register setToken={setToken} /> : <Navigate to="/catalog" />} />
        <Route path="/catalog" element={<Catalog addToCart={addToCart} />} />
        <Route path="/cart" element={<Cart cart={cart} setCart={setCart} updateCartQuantity={updateCartQuantity} removeFromCart={removeFromCart} token={token} />} />
        <Route path="/orders" element={token ? <Orders token={token} user={user} /> : <Navigate to="/login" />} />
        <Route path="/admin" element={(token && user?.role==='ADMIN') ? <AdminDashboard token={token}/> : <Navigate to="/" />} />
      </Routes>
    </div>
  )
}
