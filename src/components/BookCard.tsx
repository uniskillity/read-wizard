import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Heart, Star, Download } from "lucide-react";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface BookCardProps {
  id: string;
  title: string;
  author: string;
  description?: string;
  genre: string;
  rating?: number;
  publishedYear?: number;
  imageUrl?: string;
  department?: string;
  semester?: number;
  courseCode?: string;
  pdfUrl?: string;
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
  imageUrl,
  department,
  semester,
  courseCode,
  pdfUrl,
  onSave,
  onRate,
}: BookCardProps) => {
  const [isSaved, setIsSaved] = useState(false);
  const [userRating, setUserRating] = useState<number>(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleSave = () => {
    setIsSaved(!isSaved);
    onSave?.(id);
  };

  const handleRate = (stars: number) => {
    setUserRating(stars);
    onRate?.(id, stars);
  };

  // Generate a placeholder cover based on book title if no image
  const getPlaceholderCover = () => {
    const colors = [
      'from-blue-500 to-blue-700',
      'from-green-500 to-green-700', 
      'from-purple-500 to-purple-700',
      'from-red-500 to-red-700',
      'from-orange-500 to-orange-700',
      'from-teal-500 to-teal-700',
      'from-indigo-500 to-indigo-700',
      'from-pink-500 to-pink-700',
    ];
    const index = title.length % colors.length;
    return colors[index];
  };

  return (
    <Card className="group h-full overflow-hidden transition-all duration-300 hover:shadow-book hover:-translate-y-2 hover:border-primary/20">
      <div className="w-full h-48 overflow-hidden relative bg-muted">
        {imageUrl && !imageError ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 bg-muted animate-pulse" />
            )}
            <img 
              src={imageUrl.replace('http:', 'https:')} 
              alt={title}
              className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          </>
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${getPlaceholderCover()} flex items-center justify-center p-4`}>
            <div className="text-center text-white">
              <BookOpen className="h-10 w-10 mx-auto mb-2 opacity-80" />
              <p className="text-xs font-medium opacity-90 line-clamp-2">{title}</p>
            </div>
          </div>
        )}
        {pdfUrl && (
          <div className="absolute top-2 right-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="bg-primary text-primary-foreground p-1.5 rounded-full shadow-lg">
                  <Download className="h-3 w-3" />
                </div>
              </TooltipTrigger>
              <TooltipContent>PDF Available</TooltipContent>
            </Tooltip>
          </div>
        )}
      </div>
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="font-serif text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
              {title}
            </CardTitle>
            <CardDescription className="font-sans text-sm mt-1 line-clamp-1">
              {author}
            </CardDescription>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 hover:bg-primary/10"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSave();
                }}
              >
                <Heart
                  className={`h-5 w-5 transition-all ${
                    isSaved ? "fill-secondary text-secondary scale-110" : "hover:text-secondary"
                  }`}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{isSaved ? "Saved" : "Save for later"}</TooltipContent>
          </Tooltip>
        </div>
        
        <div className="flex items-center gap-1.5 flex-wrap">
          {department && (
            <Badge variant="outline" className="font-sans text-[10px] bg-primary/5 text-primary border-primary/20 truncate max-w-[120px]">
              {department.replace('BS ', '')}
            </Badge>
          )}
          {semester && (
            <Badge variant="secondary" className="font-sans text-[10px] bg-secondary/10 text-secondary">
              Sem {semester}
            </Badge>
          )}
          {courseCode && (
            <Badge variant="outline" className="font-sans text-[10px]">
              {courseCode}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        {description && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {description}
          </p>
        )}

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-primary text-primary" />
            <span className="text-sm font-medium">{rating.toFixed(1)}</span>
          </div>

          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleRate(star);
                }}
                className="transition-transform hover:scale-125 p-0.5"
              >
                <Star
                  className={`h-3.5 w-3.5 transition-colors ${
                    star <= userRating
                      ? "fill-primary text-primary"
                      : "text-muted-foreground/50 hover:text-primary/50"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors" variant="outline" size="sm">
          <BookOpen className="mr-2 h-4 w-4" />
          View Details
        </Button>
      </CardContent>
    </Card>
  );
};
