import React, { useState } from 'react'
import { api } from '../api'
import { useNavigate } from 'react-router-dom'

export default function Login({ setToken }){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const nav = useNavigate()

  const submit = async (e)=>{
    e.preventDefault()
    try{
      const r = await api('/auth/login','POST',{email,password})
      setToken(r.token)
      nav('/catalog')
    }catch(e){ setError('Invalid credentials') }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow">
      <h1 className="text-xl font-semibold mb-4">Login</h1>
      <form onSubmit={submit} className="space-y-3">
        <input className="w-full border rounded px-3 py-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input type="password" className="w-full border rounded px-3 py-2" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="w-full bg-blue-600 text-white py-2 rounded">Sign in</button>
      </form>
    </div>
  )
}
