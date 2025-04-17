import React, { useState, useCallback, useEffect, useRef } from "react";
import { View, ScrollView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getFilteredMovies } from "@/api/movies";
import { MovieBase } from "@/types/movie-type";
import { router } from "expo-router";
import SearchFilterModal from "@/components/modals/search-filter-modal";

// Import components
import SearchHeader from "./components/SearchHeader";
import SearchResults from "./components/SearchResults";
import Pagination from "./components/Pagination";
import EmptyState from "./components/EmptyState";
import LoadingState from "./components/LoadingState";

const SearchPage = () => {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<MovieBase[]>([]);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const [activeFilters, setActiveFilters] = useState<{
    typeId?: string;
    genreIds?: string[];
    countryId?: string;
    startYear?: number;
    endYear?: number;
  }>({});

  // Debounce function to limit API calls
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debounceSearch = useCallback((query: string, filters: any, page: number) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      if (query.trim().length > 0 || Object.keys(filters).length > 0) {
        fetchResults(query, filters, page);
      } else {
        setResults([]);
        setTotalPages(0);
        setTotalResults(0);
      }
    }, 500);
  }, []);

  useEffect(() => {
    debounceSearch(searchQuery, activeFilters, currentPage);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [searchQuery, activeFilters, currentPage]);

  const fetchResults = async (query: string, filters: any, page: number) => {
    try {
      setIsSearching(true);
      const response = await getFilteredMovies({
        name: query,
        page,
        limit: 20,
        ...filters,
      });

      setResults(response.data);
      setTotalPages(response.pagination.totalPages);
      setTotalResults(response.pagination.totalCount);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleFilterApply = (filters: any) => {
    setActiveFilters(filters);
    setCurrentPage(1);
    setFilterModalVisible(false);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setResults([]);
    setTotalPages(0);
    setTotalResults(0);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleBackPress = () => {
    router.back();
  };

  const handleClearFilters = () => {
    setActiveFilters({});
    setCurrentPage(1);
  };

  const hasActiveFilters = Object.keys(activeFilters).length > 0;

  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" />

      {/* Header with search bar */}
      <SearchHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onClearSearch={handleClearSearch}
        onOpenFilters={() => setFilterModalVisible(true)}
        onBackPress={handleBackPress}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Main content */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingTop: insets.top + 70,
          paddingBottom: insets.bottom + 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {isSearching ? (
          <LoadingState />
        ) : results.length > 0 ? (
          <View>
            <SearchResults
              results={results}
              totalResults={totalResults}
              currentPage={currentPage}
              totalPages={totalPages}
              onClearFilters={handleClearFilters}
              hasActiveFilters={hasActiveFilters}
            />

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onNextPage={goToNextPage}
              onPrevPage={goToPrevPage}
            />
          </View>
        ) : (
          <EmptyState searchQuery={searchQuery} />
        )}
      </ScrollView>

      {/* Filter Modal */}
      <SearchFilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApply={handleFilterApply}
        initialFilters={activeFilters}
      />
    </View>
  );
};

export default SearchPage;