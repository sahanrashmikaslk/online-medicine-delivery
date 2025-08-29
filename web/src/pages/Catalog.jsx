import React, { useEffect, useState } from 'react'
import { api } from '../api'

export default function Catalog({ addToCart }){
  const [list, setList] = useState([])
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)
  const [addingToCart, setAddingToCart] = useState(null)

  useEffect(()=>{ load() },[])

  async function load(){
    setLoading(true)
    try {
      const r = await api(`/catalog/medicines${q?`?search=${encodeURIComponent(q)}`:''}`)
      setList(r)
    } catch (error) {
      console.error('Failed to load medicines:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async (medicine) => {
    setAddingToCart(medicine.id)
    try {
      addToCart(medicine)
      // Brief delay for visual feedback
      setTimeout(() => setAddingToCart(null), 500)
    } catch (error) {
      setAddingToCart(null)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    load()
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Medicine Catalog
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Browse our comprehensive collection of medicines and healthcare products
        </p>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input 
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-gray-900 placeholder-gray-500" 
              placeholder="Search medicines by name or description..." 
              value={q} 
              onChange={e=>setQ(e.target.value)}
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200 font-medium"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Searching...
              </div>
            ) : (
              'Search'
            )}
          </button>
        </form>
      </div>

      {/* Results Count */}
      {!loading && (
        <div className="mb-6">
          <p className="text-gray-600">
            {list.length === 0 ? (
              q ? `No medicines found for "${q}"` : 'No medicines available'
            ) : (
              <>Found <span className="font-semibold text-gray-900">{list.length}</span> medicine{list.length !== 1 ? 's' : ''}{q && ` for "${q}"`}</>
            )}
          </p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading medicines...</p>
          </div>
        </div>
      )}

      {/* Medicine Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map(medicine=>(
            <div key={medicine.id} className="bg-white rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
              {/* Medicine Image Placeholder */}
              <div className="h-48 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center group-hover:from-blue-100 group-hover:to-indigo-200 transition-colors">
                <div className="w-16 h-16 bg-white rounded-full shadow-md flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 7.172V5L8 4z" />
                  </svg>
                </div>
              </div>

              <div className="p-6">
                {/* Medicine Name */}
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {medicine.name}
                </h3>
                
                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {medicine.description || 'No description available'}
                </p>

                {/* Stock Status */}
                <div className="mb-4">
                  {medicine.stock > 0 ? (
                    <div className="flex items-center text-green-600">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-medium">In Stock ({medicine.stock} available)</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-red-500">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span className="text-sm font-medium">Out of Stock</span>
                    </div>
                  )}
                </div>

                {/* Price and Add to Cart */}
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-gray-900">
                    Rs.{Number(medicine.price).toFixed(2)}
                  </div>
                  <button 
                    onClick={() => handleAddToCart(medicine)}
                    disabled={medicine.stock === 0 || addingToCart === medicine.id}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 transform hover:scale-105 ${
                      medicine.stock === 0 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : addingToCart === medicine.id
                        ? 'bg-green-500 text-white'
                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                    }`}
                  >
                    {addingToCart === medicine.id ? (
                      <div className="flex items-center">
                        <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Added!
                      </div>
                    ) : medicine.stock === 0 ? (
                      'Out of Stock'
                    ) : (
                      <>
                        <svg className="inline-block w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5H21M7 13v6a1 1 0 001 1h8a1 1 0 001-1v-6m-9 0V9a1 1 0 011-1h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H16a1 1 0 011 1v3" />
                        </svg>
                        Add to Cart
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && list.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {q ? 'No medicines found' : 'No medicines available'}
          </h3>
          <p className="text-gray-600 mb-6">
            {q ? `Try searching with different keywords` : 'Check back later for new medicines'}
          </p>
          {q && (
            <button 
              onClick={() => {setQ(''); load()}}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear Search
            </button>
          )}
        </div>
      )}
    </div>
  )
}
