import React, { useState, useCallback, useEffect, useRef } from "react";
import { View, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useIsFocused } from "@react-navigation/native";
import { getFilteredMovies } from "@/api/movies";
import { MovieBase } from "@/types/movie-type";
import { router } from "expo-router";
import SearchFilterModal from "@/components/modals/search-filter-modal";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/ui/text";

// Import components
import SearchHeader from "./components/search-header";
import SearchResults from "./components/search-results";
import Pagination from "./components/list-pagination";
import EmptyState from "./components/empty-state";
import LoadingState from "./components/loading-state";
import SearchWithAI from "./components/search-with-ai";

const SearchPage = () => {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const [searchQuery, setSearchQuery] = useState("");
  const [contentSearchQuery, setContentSearchQuery] = useState("");
  const [showContentSearch, setShowContentSearch] = useState(false);
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

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debounceSearch = useCallback((query: string, contentQuery: string, filters: any, page: number) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      if (!isFocused) return;

      if (query.trim().length > 0 || contentQuery.trim().length > 0 || Object.keys(filters).length > 0) {
        fetchResults(query, contentQuery, filters, page);
      } else {
        setResults([]);
        setTotalPages(0);
        setTotalResults(0);
      }
    }, 500);
  }, [isFocused]);

  useEffect(() => {
    if (isFocused) {
      debounceSearch(searchQuery, contentSearchQuery, activeFilters, currentPage);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [searchQuery, contentSearchQuery, activeFilters, currentPage, isFocused]);

  const fetchResults = async (query: string, contentQuery: string, filters: any, page: number) => {
    if (!isFocused) return;

    try {
      setIsSearching(true);
      const response = await getFilteredMovies({
        name: query,
        contentSearch: contentQuery,
        page,
        limit: 10,
        ...filters,
      });

      if (isFocused) {
        setResults(response.data);
        setTotalPages(response.pagination.totalPages);
        setTotalResults(response.pagination.totalCount);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      if (isFocused) {
        setIsSearching(false);
      }
    }
  };

  const handleFilterApply = (filters: any) => {
    setActiveFilters(filters);
    setCurrentPage(1);
    setFilterModalVisible(false);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setContentSearchQuery("");
    setResults([]);
    setTotalPages(0);
    setTotalResults(0);
  };

  const toggleContentSearch = () => {
    setShowContentSearch(!showContentSearch);
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

  if (!isFocused) {
    return null;
  }

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

      {/* AI Content Search Section */}
      <View style={{ marginTop: insets.top + 60 }}>
        <SearchWithAI
          contentSearchQuery={contentSearchQuery}
          onContentSearchChange={setContentSearchQuery}
          onClearContentSearch={() => setContentSearchQuery("")}
          onToggleContentSearch={toggleContentSearch}
          showContentSearch={showContentSearch}
        />
      </View>

      {/* Main content */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingTop: 20,
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
          <EmptyState searchQuery={searchQuery || contentSearchQuery} />
        )}
      </ScrollView>

      {/* Filter Modal */}
      {isFocused && (
        <SearchFilterModal
          visible={filterModalVisible}
          onClose={() => setFilterModalVisible(false)}
          onApply={handleFilterApply}
          initialFilters={activeFilters}
        />
      )}
    </View>
  );
};

export default SearchPage;