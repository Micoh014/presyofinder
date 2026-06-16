import { useState } from 'react'

export function useSearch() {
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [sortMode, setSortMode] = useState('price-asc')

  function handleSearchResults(results) {
    setSearchResults(results)
    setSearching(true)
  }

  function handleSearchClear() {
    setSearchResults([])
    setSearching(false)
  }

  function hideSearch() {
    setSearching(false)
  }

  function reshowSearch() {
    if (searchResults.length > 0) setSearching(true)
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