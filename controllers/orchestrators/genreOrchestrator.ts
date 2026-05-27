import { useState, useEffect, useCallback } from "react";
import { Genre } from "../../app/types"
import { GenreService } from "../services/genreServices";

export const useGenreOrchestrator = () => {
    const [genres, setGenres] = useState<Genre[]>([]);
    const [genreTags, setGenreTags] = useState<string[]>([]);
    const [filteredGenres, setFilteredGenres] = useState<Genre[]>([]);
    const [currentGenre, setCurrentGenre] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [dropdownVisible, setDropdownVisible] = useState(false);

    useEffect(() => {
        const loadGenres = async () => {
            setIsLoading(true);
            try {
                const genreData = await GenreService.fetchGenres();
                setGenres(genreData);
            } catch (error: any) {
                return { succcess: false, message: error.message || "Failed to load genres" }
            } finally {
                setIsLoading(false);
            }
        };
        loadGenres();
    }, [])

    useEffect(() => {
        const filtered = GenreService.filterGenres(genres, currentGenre);
        setFilteredGenres(filtered);
      }, [genres, currentGenre])  

    const addGenre = (genreName?: string) => {
        const toAdd = genreName || currentGenre;
        const updatedGenres = GenreService.addGenreToList(toAdd, genreTags)

        if (updatedGenres.length > genreTags.length) {
            setGenreTags(updatedGenres);
            setCurrentGenre(""); // Clear search
            return { success: true, message: "Genre added successfully" };
        }
        return { success: false, message: "Genre already exists" };
    }

    const removeGenre = (tag: string) => {
        const updatedGenres = GenreService.removeGenreFromList(tag, genreTags);
        setGenreTags(updatedGenres);
        return { success: true, message: "Genre removed" };
    };

    const updateGenreInput = (text: string) => {
        setCurrentGenre(text);
        setDropdownVisible(text.length > 0);
    };

    const showDropdown = () => setDropdownVisible(true);
    const hideDropdown = () => setDropdownVisible(false);

    const initializeGenreTags = useCallback((tags: string[]) => {
        setGenreTags(tags || []);
    }, []);

    return {
        // ✅ Read-only state
        genres,
        filteredGenres,
        genreTags,
        setGenreTags,
        isLoading, 
        currentGenre,
        dropdownVisible, // ← Add this

        // ✅ Functions only - no setters
        addGenre,
        removeGenre,
        updateGenreInput,
        showDropdown,
        hideDropdown,
        initializeGenreTags
    }
}