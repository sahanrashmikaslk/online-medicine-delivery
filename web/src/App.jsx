import React, { useEffect, useState } from 'react'
import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Catalog from './pages/Catalog.jsx'
import Cart from './pages/Cart.jsx'
import Orders from './pages/Orders.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import { api } from './api'

export default function App(){
  const [token, setToken] = useState(localStorage.getItem('token')||'')
  const [user, setUser] = useState(null)
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('cart')||'[]'))

  useEffect(()=>{ localStorage.setItem('token', token||'') }, [token])
  useEffect(()=>{ localStorage.setItem('cart', JSON.stringify(cart)) }, [cart])

  // load user (role) whenever token changes
  useEffect(()=> {
    let ignore=false
    async function loadMe(){
      if(!token){ setUser(null); return; }
      try{
        const me = await api('/auth/me','GET',undefined, token)
        if(!ignore) setUser(me)
      }catch(e){ setUser(null) }
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

  const onLogout = ()=> { setToken(''); setUser(null) }

  return (
    <div>
      <Navbar token={token} user={user} onLogout={onLogout}/>
      <div className="p-3">
        <div className="max-w-4xl mx-auto flex justify-end">
          <Link to="/cart" className="text-blue-600 underline">Cart ({cart.reduce((s,i)=>s+i.qty,0)})</Link>
        </div>
      </div>
      <Routes>
        <Route path="/" element={<Navigate to="/catalog" />} />
        <Route path="/login" element={<Login setToken={setToken} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/catalog" element={<Catalog addToCart={addToCart} />} />
        <Route path="/cart" element={<Cart cart={cart} setCart={setCart} token={token} />} />
        <Route path="/orders" element={token ? <Orders token={token} /> : <Navigate to="/login" />} />
        <Route path="/admin" element={(token && user?.role==='ADMIN') ? <AdminDashboard token={token}/> : <Navigate to="/" />} />
      </Routes>
    </div>
  )
}
