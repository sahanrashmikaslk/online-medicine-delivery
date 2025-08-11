import React from 'react'
import { Link } from 'react-router-dom'

export default function Navbar({ token, user, onLogout }){
  return (
    <nav className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between shadow">
      <Link to="/" className="font-bold">Meds</Link>
      <div className="flex items-center gap-4">
        <Link to="/catalog" className="hover:opacity-90">Catalog</Link>
        {token && <Link to="/orders" className="hover:opacity-90">My Orders</Link>}
        {token && user?.role === 'ADMIN' && (
          <Link to="/admin" className="hover:opacity-90 font-semibold underline">Admin</Link>
        )}
        {!token ? (
          <>
            <Link to="/login" className="bg-white text-blue-600 px-3 py-1 rounded">Login</Link>
            <Link to="/register" className="border border-white px-3 py-1 rounded">Register</Link>
          </>
        ) : (
          <button onClick={onLogout} className="bg-white text-blue-600 px-3 py-1 rounded">Logout</button>
        )}
      </div>
    </nav>
  )
}
