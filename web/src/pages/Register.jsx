import React, { useState } from 'react'
import { api } from '../api'
import { useNavigate } from 'react-router-dom'

export default function Register(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const nav = useNavigate()

  const submit = async (e)=>{
    e.preventDefault()
    await api('/auth/register', 'POST', {email, password})
    setMsg('Registered! You can now login.')
    setTimeout(()=>nav('/login'), 800)
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow">
      <h1 className="text-xl font-semibold mb-4">Create account</h1>
      <form onSubmit={submit} className="space-y-3">
        <input className="w-full border rounded px-3 py-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input type="password" className="w-full border rounded px-3 py-2" placeholder="Password (min 8)" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="w-full bg-blue-600 text-white py-2 rounded">Register</button>
      </form>
      {msg && <div className="text-green-700 mt-3">{msg}</div>}
    </div>
  )
}
