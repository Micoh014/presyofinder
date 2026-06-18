import { useState, useEffect } from 'react'
import { searchItemsByName } from '../services/db'
import { supabase } from '../services/supabase'

const FALLBACKS = ['Rice', 'Egg', 'Cooking Oil', 'Sugar', 'Salt', 'Pandesal']

export function useFrequentItems(userId) {
  const [frequentItems, setFrequentItems] = useState(FALLBACKS)

  useEffect(() => {
    if (!userId) return
    fetchFrequent()
  }, [userId])

  async function fetchFrequent() {
    const { data, error } = await supabase
      .from('items')
      .select('name')
      .eq('user_id', userId)

    if (error || !data || data.length === 0) {
      setFrequentItems(FALLBACKS)
      return
    }

    // Count frequency of each item name (case-insensitive)
    const counts = {}
    data.forEach(({ name }) => {
      const key = name.trim().toLowerCase()
      counts[key] = (counts[key] || 0) + 1
    })

    // Sort by frequency, take top 6, preserve original casing from first occurrence
    const casing = {}
    data.forEach(({ name }) => {
      const key = name.trim().toLowerCase()
      if (!casing[key]) casing[key] = name.trim()
    })

    const sorted = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([key]) => casing[key])

    // Fill remaining slots with fallbacks not already in the list
    const existing = new Set(sorted.map(s => s.toLowerCase()))
    const filled = [...sorted]
    for (const fb of FALLBACKS) {
      if (filled.length >= 6) break
      if (!existing.has(fb.toLowerCase())) {
        filled.push(fb)
        existing.add(fb.toLowerCase())
      }
    }

    setFrequentItems(filled)
  }

  return { frequentItems }
}