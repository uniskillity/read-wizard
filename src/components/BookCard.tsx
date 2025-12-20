import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Heart, Star, Download, Eye, Sparkles } from "lucide-react";
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
  const [isHovered, setIsHovered] = useState(false);

  const handleSave = () => {
    setIsSaved(!isSaved);
    onSave?.(id);
  };

  const handleRate = (stars: number) => {
    setUserRating(stars);
    onRate?.(id, stars);
  };

  // Generate a placeholder gradient based on book title
  const getPlaceholderGradient = () => {
    const gradients = [
      'from-primary via-primary/80 to-primary-glow',
      'from-secondary via-secondary/80 to-secondary/60',
      'from-primary/90 via-secondary/70 to-primary/60',
      'from-[hsl(220,70%,35%)] via-[hsl(220,60%,45%)] to-[hsl(220,50%,55%)]',
      'from-[hsl(0,75%,40%)] via-[hsl(0,65%,50%)] to-[hsl(0,55%,60%)]',
      'from-[hsl(200,70%,35%)] via-[hsl(200,60%,45%)] to-[hsl(200,50%,55%)]',
      'from-[hsl(260,60%,40%)] via-[hsl(260,50%,50%)] to-[hsl(260,40%,60%)]',
      'from-[hsl(160,60%,35%)] via-[hsl(160,50%,45%)] to-[hsl(160,40%,55%)]',
    ];
    const index = title.length % gradients.length;
    return gradients[index];
  };

  return (
    <Card 
      className="group h-full overflow-hidden transition-all duration-500 hover:shadow-book hover:-translate-y-2 border-border/50 hover:border-primary/30 bg-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Section */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {imageUrl && !imageError ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted-foreground/10 animate-pulse" />
            )}
            <img 
              src={imageUrl.replace('http:', 'https:')} 
              alt={title}
              className={`w-full h-full object-cover transition-all duration-700 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              } ${isHovered ? 'scale-110 blur-[1px]' : 'scale-100'}`}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
            {/* Overlay on hover */}
            <div className={`absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent transition-opacity duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`} />
          </>
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${getPlaceholderGradient()} flex items-center justify-center p-6 relative overflow-hidden`}>
            {/* Decorative pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 left-4 w-16 h-16 border-2 border-white rounded-lg rotate-12" />
              <div className="absolute bottom-4 right-4 w-12 h-12 border-2 border-white rounded-full" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border border-white/30 rounded-lg rotate-45" />
            </div>
            <div className="text-center text-white relative z-10">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm mb-3">
                <BookOpen className="h-7 w-7" />
              </div>
              <p className="text-sm font-medium line-clamp-2 leading-tight">{title}</p>
            </div>
          </div>
        )}

        {/* Top badges */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
          {/* Rating badge */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-xs font-medium">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span>{rating.toFixed(1)}</span>
          </div>
          
          {/* PDF indicator */}
          {pdfUrl && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium shadow-lg">
                  <Download className="h-3 w-3" />
                  <span className="hidden sm:inline">PDF</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>Download PDF</TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Save button - floating */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className={`absolute bottom-3 right-3 p-2.5 rounded-full shadow-lg transition-all duration-300 ${
                isSaved 
                  ? 'bg-secondary text-secondary-foreground scale-110' 
                  : 'bg-white/90 text-foreground hover:bg-white hover:scale-110'
              }`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSave();
              }}
            >
              <Heart className={`h-4 w-4 transition-all ${isSaved ? 'fill-current animate-scale-in' : ''}`} />
            </button>
          </TooltipTrigger>
          <TooltipContent>{isSaved ? "Saved!" : "Save for later"}</TooltipContent>
        </Tooltip>

        {/* Hover overlay content */}
        <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
          isHovered && imageUrl && !imageError ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/95 text-foreground font-medium shadow-xl">
            <Eye className="h-4 w-4" />
            <span className="text-sm">View Details</span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <CardHeader className="space-y-3 pb-3">
        <div className="space-y-1">
          <CardTitle className="font-serif text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-300">
            {title}
          </CardTitle>
          <CardDescription className="font-sans text-sm line-clamp-1 flex items-center gap-1">
            <span className="text-muted-foreground">by</span>
            <span className="font-medium text-foreground/80">{author}</span>
          </CardDescription>
        </div>
        
        {/* Tags */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {semester && (
            <Badge className="font-sans text-[10px] bg-primary text-primary-foreground border-0 shadow-sm">
              Semester {semester}
            </Badge>
          )}
          {department && (
            <Badge variant="outline" className="font-sans text-[10px] bg-muted/50 border-border truncate max-w-[100px]">
              {department.replace('BS ', '')}
            </Badge>
          )}
          {courseCode && (
            <Badge variant="secondary" className="font-sans text-[10px] bg-secondary/10 text-secondary border-0">
              {courseCode}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Description */}
        {description && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {description}
          </p>
        )}

        {/* Rating section */}
        <div className="flex items-center justify-between py-3 px-3 -mx-3 bg-muted/30 rounded-lg">
          <span className="text-xs text-muted-foreground font-medium">Your rating</span>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleRate(star);
                }}
                className="transition-all duration-200 hover:scale-125 p-0.5"
              >
                <Star
                  className={`h-4 w-4 transition-all duration-200 ${
                    star <= userRating
                      ? "fill-yellow-400 text-yellow-400 drop-shadow-sm"
                      : "text-muted-foreground/30 hover:text-yellow-400/50"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Action button */}
        <Button 
          className="w-full h-10 font-medium transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-lg" 
          variant="outline"
        >
          <Sparkles className="mr-2 h-4 w-4 transition-transform group-hover:rotate-12" />
          Explore Book
        </Button>
      </CardContent>
    </Card>
  );
};