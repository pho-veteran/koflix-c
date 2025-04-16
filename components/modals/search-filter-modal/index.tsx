import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getGenres, getTypes, getCountries } from '@/api/movies';
import { LOADING } from '@/constants/ui-constants';
import { Text } from '@/components/ui/text';
import { AlertDialog, AlertDialogBackdrop, AlertDialogContent, AlertDialogBody } from '@/components/ui/alert-dialog';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MovieGenre, MovieType } from '@/types/movie';

// Import components
import Header from './components/header';
import FilterBadges from './components/filter-badges';
import TabSelector from './components/tab-selector';
import FilterList from './components/filter-list';
import YearSelector from './components/year-selector';
import ActionButtons from './components/action-buttons';

// Interfaces
interface SearchFilterModalProps {
    visible: boolean;
    onClose: () => void;
    onApply: (filters: any) => void;
    initialFilters?: {
        typeId?: string;
        genreIds?: string[];
        countryId?: string;
        startYear?: number;
        endYear?: number;
    };
}

interface Country {
    id: string;
    name: string;
    slug: string;
}

export default function SearchFilterModal({
    visible,
    onClose,
    onApply,
    initialFilters = {}
}: SearchFilterModalProps) {
    const insets = useSafeAreaInsets();
    const [activeTab, setActiveTab] = useState<'genres' | 'types' | 'countries' | 'years'>('genres');
    const [genres, setGenres] = useState<MovieGenre[]>([]);
    const [types, setTypes] = useState<MovieType[]>([]);
    const [countries, setCountries] = useState<Country[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Change to array-based selections for multiple items
    const [selectedTypeId, setSelectedTypeId] = useState<string | undefined>(initialFilters.typeId);
    const [selectedGenreIds, setSelectedGenreIds] = useState<string[]>(initialFilters.genreIds || []);
    const [selectedCountryId, setSelectedCountryId] = useState<string | undefined>(initialFilters.countryId);
    const [selectedStartYear, setSelectedStartYear] = useState<number | undefined>(initialFilters.startYear);
    const [selectedEndYear, setSelectedEndYear] = useState<number | undefined>(initialFilters.endYear);

    // Maps to store name lookup for selected items
    const [selectedTypeName, setSelectedTypeName] = useState<string>("");
    const [selectedGenreNames, setSelectedGenreNames] = useState<Record<string, string>>({});
    const [selectedCountryName, setSelectedCountryName] = useState<string>("");

    const [startYearInput, setStartYearInput] = useState(initialFilters.startYear?.toString() || '');
    const [endYearInput, setEndYearInput] = useState(initialFilters.endYear?.toString() || '');

    useEffect(() => {
        if (visible) {
            fetchFilters();

            // Reset selected filters to initial values when opening modal
            setSelectedTypeId(initialFilters.typeId);
            setSelectedGenreIds(initialFilters.genreIds || []);
            setSelectedCountryId(initialFilters.countryId);
            setSelectedStartYear(initialFilters.startYear);
            setSelectedEndYear(initialFilters.endYear);

            setStartYearInput(initialFilters.startYear?.toString() || '');
            setEndYearInput(initialFilters.endYear?.toString() || '');
        }
    }, [visible, initialFilters]);

    const fetchFilters = async () => {
        setIsLoading(true);
        try {
            const [genresData, typesData, countriesData] = await Promise.all([
                getGenres(),
                getTypes(),
                getCountries()
            ]);
            setGenres(genresData);
            setTypes(typesData);
            setCountries(countriesData);

            // Create name lookup maps
            // Lines around the error:
            const typeNameMap: Record<string, string> = {};
            typesData.forEach((t: MovieType) => { typeNameMap[t.id] = t.name; });

            const genreNameMap: Record<string, string> = {};
            genresData.forEach((g: MovieGenre) => { genreNameMap[g.id] = g.name; });

            const countryNameMap: Record<string, string> = {};
            countriesData.forEach((c: Country) => { countryNameMap[c.id] = c.name; });

            // Initialize selected names for each type
            const typeNames: Record<string, string> = {};
            const genreNames: Record<string, string> = {};
            const countryNames: Record<string, string> = {};

            // Populate names for all selected items
            if (initialFilters.typeId) {
                if (typeNameMap[initialFilters.typeId]) typeNames[initialFilters.typeId] = typeNameMap[initialFilters.typeId];
            }

            if (initialFilters.genreIds?.length) {
                initialFilters.genreIds.forEach(id => {
                    if (genreNameMap[id]) genreNames[id] = genreNameMap[id];
                });
            }

            if (initialFilters.countryId) {
                if (countryNameMap[initialFilters.countryId]) countryNames[initialFilters.countryId] = countryNameMap[initialFilters.countryId];
            }

            setSelectedTypeName(typeNames[initialFilters.typeId || ""]);
            setSelectedGenreNames(genreNames);
            setSelectedCountryName(countryNames[initialFilters.countryId || ""]);

        } catch (error) {
            console.error("Error fetching filters:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Updated to toggle items in arrays
    const handleSelect = (id: string, name: string, category: 'genre' | 'type' | 'country') => {
        switch (category) {
            case 'type':
                // Toggle for single selection
                setSelectedTypeId(id === selectedTypeId ? undefined : id);
                setSelectedTypeName(id === selectedTypeId ? "" : name);
                break;
            case 'genre':
                setSelectedGenreIds(prev => {
                    const newSelection = prev.includes(id)
                        ? prev.filter(item => item !== id)
                        : [...prev, id];

                    const newNames = { ...selectedGenreNames };
                    if (newSelection.includes(id)) {
                        newNames[id] = name;
                    } else {
                        delete newNames[id];
                    }
                    setSelectedGenreNames(newNames);

                    return newSelection;
                });
                break;
            case 'country':
                // Toggle for single selection
                setSelectedCountryId(id === selectedCountryId ? undefined : id);
                setSelectedCountryName(id === selectedCountryId ? "" : name);
                break;
        }
    };

    const handleYearInputChange = (value: string, type: 'start' | 'end') => {
        const numericValue = value.replace(/[^0-9]/g, '').slice(0, 4);
        const currentYear = new Date().getFullYear();

        if (type === 'start') {
            setStartYearInput(numericValue);
        } else {
            setEndYearInput(numericValue);
        }

        if (numericValue.length === 4) {
            const year = parseInt(numericValue, 10);
            if (year >= 1900 && year <= currentYear) {

                if (type === 'start') {
                    setSelectedStartYear(year);
                    if (selectedEndYear !== undefined && year > selectedEndYear) {
                        setSelectedEndYear(undefined);
                        setEndYearInput('');
                    }
                } else { // type === 'end'
                    setSelectedEndYear(year);
                    if (selectedStartYear !== undefined && year < selectedStartYear) {
                        setSelectedStartYear(undefined);
                        setStartYearInput('');
                    }
                }
            } else {
                if (type === 'start') {
                    setSelectedStartYear(undefined);
                } else {
                    setSelectedEndYear(undefined);
                }
            }
        } else {

            if (type === 'start') {
                setSelectedStartYear(undefined);
            } else {
                setSelectedEndYear(undefined);
            }
        }
    };

    const handleApply = () => {
        const filters = {
            ...(selectedTypeId && { typeId: selectedTypeId }),
            ...(selectedGenreIds.length > 0 && { genreIds: selectedGenreIds }),
            ...(selectedCountryId && { countryId: selectedCountryId }),
            ...(selectedStartYear && { startYear: selectedStartYear }),
            ...(selectedEndYear && { endYear: selectedEndYear }),
        };
        onApply(filters);
    };

    const handleClearAll = () => {
        setSelectedTypeId(undefined);
        setSelectedGenreIds([]);
        setSelectedCountryId(undefined);
        setSelectedStartYear(undefined);
        setSelectedEndYear(undefined);
        setSelectedTypeName("");
        setSelectedGenreNames({});
        setSelectedCountryName("");
        setStartYearInput('');
        setEndYearInput('');
    };

    // Check for active filters
    const hasActiveFilters = !!(
        selectedTypeId ||
        selectedGenreIds.length > 0 ||
        selectedCountryId ||
        selectedStartYear ||
        selectedEndYear
    );

    // Build filter badges from all selected items
    const selectedFilters = [
        selectedTypeId && {
            id: `type-${selectedTypeId}`,
            name: selectedTypeName,
            onRemove: () => {
                setSelectedTypeId(undefined);
                setSelectedTypeName("");
            }
        },

        ...Object.entries(selectedGenreNames).map(([id, name]) => ({
            id: `genre-${id}`,
            name: name,
            onRemove: () => {
                setSelectedGenreIds(prev => prev.filter(item => item !== id));
                setSelectedGenreNames(prev => {
                    const newNames = { ...prev };
                    delete newNames[id];
                    return newNames;
                });
            }
        })),

        selectedCountryId && {
            id: `country-${selectedCountryId}`,
            name: selectedCountryName,
            onRemove: () => {
                setSelectedCountryId(undefined);
                setSelectedCountryName("");
            }
        },

        selectedStartYear && selectedEndYear && {
            id: 'yearRange',
            name: `Năm ${selectedStartYear}-${selectedEndYear}`,
            onRemove: () => {
                setSelectedStartYear(undefined);
                setSelectedEndYear(undefined);
                setStartYearInput('');
                setEndYearInput('');
            }
        },
        selectedStartYear && !selectedEndYear && {
            id: 'startYear',
            name: `Từ năm ${selectedStartYear}`,
            onRemove: () => {
                setSelectedStartYear(undefined);
                setStartYearInput('');
            }
        },
        !selectedStartYear && selectedEndYear && {
            id: 'endYear',
            name: `Đến năm ${selectedEndYear}`,
            onRemove: () => {
                setSelectedEndYear(undefined);
                setEndYearInput('');
            }
        }
    ].filter(Boolean) as { id: string; name: string; onRemove: () => void }[];

    return (
        <AlertDialog isOpen={visible}>
            <AlertDialogBackdrop onPress={onClose} className="bg-black/70" />
            <AlertDialogContent
                className="m-0 p-0 border-0 rounded-3xl bg-transparent overflow-hidden w-[85%] mx-auto"
                style={{ maxHeight: '80%' }}
            >
                <BlurView intensity={25} tint="dark" className="w-full h-full">
                    <LinearGradient
                        colors={['rgba(18,18,24,0.97)', 'rgba(10,10,14,0.98)']}
                        className="w-full h-full rounded-3xl overflow-hidden"
                    >
                        {/* Header */}
                        <Header onClose={onClose} />

                        {/* Selected filters */}
                        <FilterBadges filters={selectedFilters} />

                        {/* Tab Selector */}
                        <TabSelector
                            activeTab={activeTab}
                            onTabChange={setActiveTab}
                        />

                        {/* Content */}
                        <AlertDialogBody className="p-0 flex-1">
                            {isLoading ? (
                                <View className="flex-1 items-center mt-16">
                                    <ActivityIndicator size="large" color={LOADING.INDICATOR_COLOR} />
                                    <Text className="text-zinc-400 mt-3">Đang tải dữ liệu...</Text>
                                </View>
                            ) : (
                                <ScrollView
                                    className="px-2 pt-2"
                                    contentContainerStyle={{
                                        paddingBottom: insets.bottom || 20,
                                    }}
                                    showsVerticalScrollIndicator={false}
                                >
                                    {activeTab === 'genres' && (
                                        <FilterList
                                            items={genres}
                                            selectedIds={selectedGenreIds}
                                            onSelect={(id, name) => handleSelect(id, name, 'genre')}
                                            multiSelect={true}
                                        />
                                    )}

                                    {activeTab === 'types' && (
                                        <FilterList
                                            items={types}
                                            selectedId={selectedTypeId}  // Changed to selectedId (single)
                                            onSelect={(id, name) => handleSelect(id, name, 'type')}
                                            multiSelect={false}  // Set to false for single selection
                                        />
                                    )}

                                    {activeTab === 'countries' && (
                                        <FilterList
                                            items={countries}
                                            selectedId={selectedCountryId}
                                            onSelect={(id, name) => handleSelect(id, name, 'country')}
                                            multiSelect={false}
                                        />
                                    )}

                                    {activeTab === 'years' && (
                                        <YearSelector
                                            startYearInput={startYearInput}
                                            endYearInput={endYearInput}
                                            onStartYearChange={(value) => handleYearInputChange(value, 'start')}
                                            onEndYearChange={(value) => handleYearInputChange(value, 'end')}
                                            onSelectPreset={(start, end) => {
                                                setStartYearInput(start);
                                                setEndYearInput(end);
                                                setSelectedStartYear(start ? parseInt(start) : undefined);
                                                setSelectedEndYear(end ? parseInt(end) : undefined);
                                            }}
                                        />
                                    )}
                                </ScrollView>
                            )}
                        </AlertDialogBody>

                        {/* Action buttons */}
                        <ActionButtons
                            onClear={handleClearAll}
                            onApply={handleApply}
                            hasFilters={hasActiveFilters}
                        />
                    </LinearGradient>
                </BlurView>
            </AlertDialogContent>
        </AlertDialog>
    );
}