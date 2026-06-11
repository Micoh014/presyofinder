import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function SearchBar({ onResults, onClear }) {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSearch(value) {
    setQuery(value)
    if (!value.trim()) {
      onClear()
      return
    }

    setLoading(true)
    const { data } = await supabase
      .from('items')
      .select('*, stores(*)')
      .ilike('name', `%${value}%`)
      .order('price', { ascending: true })
    setLoading(false)

    if (data) onResults(data)
  }

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-1000 w-[90%] max-w-md">
      <div className="relative">
        <input
          className="w-full bg-white shadow-lg rounded-full px-5 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-800 placeholder-gray-400"
          placeholder="Search item (e.g. Rice, Egg...)"
          value={query}
          onChange={e => handleSearch(e.target.value)}
        />
        {loading && (
          <span className="absolute right-4 top-3 text-gray-400 text-sm">...</span>
        )}
        {query && !loading && (
          <button
            onClick={() => handleSearch('')}
            className="absolute right-4 top-3 text-gray-400 text-sm"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}