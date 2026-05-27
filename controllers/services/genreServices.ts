type Genre = {
    _id: string;
    name: string;
};

export class GenreService {
    private static readonly GENRE_API_ENDPOINT = `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/genres/genres`

    static async fetchGenres(): Promise<Genre[]> {
        try {
            const response = await fetch(`${this.GENRE_API_ENDPOINT}/`);

            if (!response.ok) {
                throw new Error("Failed to fetch genres");
            }   
            return await response.json()
        } catch (error) {
            console.error("Error fetching genres: ", error);
            throw error;
        }   
    }

    static filterGenres(genres: Genre[], searchTerm: string) {
        if (!searchTerm.trim()) {
            return [];
        }

        return genres.filter((genre) => 
        genre.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    static validateGenreAddition(genreName: string, existingGenres: string[]): boolean {
        return genreName.trim() !== "" && !existingGenres.includes(genreName);
      }

    static addGenreToList(genreName: string, existingGenres: string[]): string[] {
        if (!this.validateGenreAddition(genreName, existingGenres)) {
          return existingGenres;
        }
        
        return [...existingGenres, genreName];
      }
    
    static removeGenreFromList(genreToRemove: string, existingGenres: string[]): string[] {
    return existingGenres.filter((genre) => genre !== genreToRemove);
    }

    // need to finish implementing this
    static normalizeGenreTags(tags: string | string[])  {
        if (typeof tags === "string") {
            return tags.split(",").map(tag => tag.trim());
        } else {
            return tags;
        }
    }
}