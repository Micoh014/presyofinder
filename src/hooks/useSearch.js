import { useState, useMemo } from 'react'

export function useSearch() {
  const [rawResults, setRawResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [sortMode, setSortMode] = useState('price-asc')

  // searchResults is a stable reference as long as rawResults + sortMode
  // haven't changed — prevents StoreMarkers from seeing a new array reference
  // on every render even when data is identical
  const searchResults = useMemo(() => {
    if (rawResults.length === 0) return rawResults
    const sorted = [...rawResults]
    if (sortMode === 'price-asc') sorted.sort((a, b) => a.price - b.price)
    if (sortMode === 'price-desc') sorted.sort((a, b) => b.price - a.price)
    if (sortMode === 'distance') {
      // distance sort is handled by SearchBar before results arrive,
      // so just return as-is here
    }
    return sorted
  }, [rawResults, sortMode])

  function handleSearchResults(results) {
    setRawResults(results)
    setSearching(true)
  }

  function handleSearchClear() {
    setRawResults([])
    setSearching(false)
  }

  function hideSearch() {
    setSearching(false)
  }

  function reshowSearch() {
    if (rawResults.length > 0) setSearching(true)
  }

  return {
    searchResults,
    searching,
    sortMode,
    setSortMode,
    handleSearchResults,
    handleSearchClear,
    hideSearch,
    reshowSearch,
  }
}