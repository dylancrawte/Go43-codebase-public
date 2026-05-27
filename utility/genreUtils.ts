export class genreUtils {
    static normaliseGenreTags(genreTags: string | string[] | undefined): string[] {
        if (!genreTags) return [];
        
        if (typeof genreTags === "string") {
          return genreTags.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0);
        }
        
        if (Array.isArray(genreTags)) {
          // If it's an array with one comma-separated string
          if (genreTags.length === 1 && genreTags[0].includes(",")) {
            return genreTags[0].split(",").map(tag => tag.trim()).filter(tag => tag.length > 0);
          }
          // If it's a proper array
          return genreTags.filter(tag => tag && tag.length > 0);
        }
        
        return [];
    }
}
    