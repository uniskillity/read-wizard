import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Heart, Star } from "lucide-react";
import { useState } from "react";

interface BookCardProps {
  id: string;
  title: string;
  author: string;
  description?: string;
  genre: string;
  rating?: number;
  publishedYear?: number;
  onSave?: (bookId: string) => void;
  onRate?: (bookId: string, rating: number) => void;
}

export const BookCard = ({
  id,
  title,
  author,
  description,
  genre,
  rating = 0,
  publishedYear,
  onSave,
  onRate,
}: BookCardProps) => {
  const [isSaved, setIsSaved] = useState(false);
  const [userRating, setUserRating] = useState<number>(0);

  const handleSave = () => {
    setIsSaved(!isSaved);
    onSave?.(id);
  };

  const handleRate = (stars: number) => {
    setUserRating(stars);
    onRate?.(id, stars);
  };

  return (
    <Card className="group h-full overflow-hidden transition-all duration-300 hover:shadow-book">
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="font-serif text-xl leading-tight line-clamp-2 group-hover:text-primary transition-colors">
              {title}
            </CardTitle>
            <CardDescription className="font-sans text-sm mt-1">
              {author}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={handleSave}
          >
            <Heart
              className={`h-5 w-5 transition-colors ${
                isSaved ? "fill-primary text-primary" : ""
              }`}
            />
          </Button>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="font-sans text-xs">
            {genre}
          </Badge>
          {publishedYear && (
            <span className="text-xs text-muted-foreground">
              {publishedYear}
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {description && (
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {description}
          </p>
        )}

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-primary text-primary" />
            <span className="text-sm font-medium">{rating.toFixed(1)}</span>
          </div>

          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleRate(star)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`h-4 w-4 transition-colors ${
                    star <= userRating
                      ? "fill-primary text-primary"
                      : "text-muted-foreground"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <Button className="w-full" variant="outline">
          <BookOpen className="mr-2 h-4 w-4" />
          View Details
        </Button>
      </CardContent>
    </Card>
  );
};
