export interface GoogleBook {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    description?: string;
    categories?: string[];
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
      large?: string;
      medium?: string;
    };
    publishedDate?: string;
    pageCount?: number;
    averageRating?: number;
    previewLink?: string;
    infoLink?: string;
    publisher?: string;
    language?: string;
    industryIdentifiers?: Array<{
      type: string;
      identifier: string;
    }>;
    canonicalVolumeLink?: string;
  };
  accessInfo?: {
    embeddable?: boolean;
    webReaderLink?: string;
    pdf?: {
      isAvailable: boolean;
      downloadLink?: string;
    };
    epub?: {
      isAvailable: boolean;
      downloadLink?: string;
    };
    accessViewStatus?: string;
  };
}

const GOOGLE_BOOKS_API = "https://www.googleapis.com/books/v1/volumes";

export const searchBooks = async (query: string, maxResults: number = 40): Promise<GoogleBook[]> => {
  try {
    const response = await fetch(
      `${GOOGLE_BOOKS_API}?q=${encodeURIComponent(query)}&maxResults=${maxResults}&orderBy=relevance`
    );
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error("Error fetching books:", error);
    return [];
  }
};

export const getBooksByCategory = async (category: string, maxResults: number = 40): Promise<GoogleBook[]> => {
  try {
    const response = await fetch(
      `${GOOGLE_BOOKS_API}?q=subject:${encodeURIComponent(category)}&maxResults=${maxResults}&orderBy=relevance`
    );
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error("Error fetching books by category:", error);
    return [];
  }
};

export const getBookDetails = async (bookId: string): Promise<GoogleBook | null> => {
  try {
    const response = await fetch(`${GOOGLE_BOOKS_API}/${bookId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching book details:", error);
    return null;
  }
};

export const getTrendingBooks = async (): Promise<GoogleBook[]> => {
  return searchBooks("bestseller 2024", 40);
};
