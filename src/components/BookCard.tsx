import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Heart, Star, Download, Eye, Sparkles, GraduationCap, Calendar, ArrowRight } from "lucide-react";
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
      className="group h-full overflow-hidden transition-all duration-500 hover:shadow-elevated hover:-translate-y-2 border-0 bg-card rounded-2xl relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Decorative corner accent */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-[100%] pointer-events-none transition-all duration-500 group-hover:opacity-100 group-hover:w-32 group-hover:h-32 opacity-0" />
      
      {/* Image Section */}
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        {imageUrl && !imageError ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted-foreground/10">
                <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-background/30 to-transparent" 
                  style={{ backgroundSize: '200% 100%' }} />
              </div>
            )}
            <img 
              src={imageUrl.replace('http:', 'https:')} 
              alt={title}
              className={`w-full h-full object-cover transition-all duration-700 ease-out ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              } ${isHovered ? 'scale-110 blur-[1px]' : 'scale-100'}`}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
            {/* Gradient overlay */}
            <div className={`absolute inset-0 transition-all duration-500 ${
              isHovered 
                ? 'bg-gradient-to-t from-primary via-primary/70 to-primary/30' 
                : 'bg-gradient-to-t from-foreground/90 via-foreground/30 to-transparent'
            }`} />
          </>
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${getPlaceholderGradient()} flex items-center justify-center p-6 relative overflow-hidden`}>
            {/* Animated decorative elements */}
            <div className="absolute inset-0">
              <div className="absolute top-6 left-6 w-20 h-20 border border-white/20 rounded-2xl rotate-12 transition-all duration-700 group-hover:rotate-45 group-hover:scale-110" />
              <div className="absolute bottom-8 right-6 w-14 h-14 border border-white/20 rounded-full transition-all duration-700 group-hover:scale-150 group-hover:opacity-0" />
              <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-32 h-32 border border-white/10 rounded-full transition-all duration-700 group-hover:w-40 group-hover:h-40 group-hover:border-white/20" />
              <div className="absolute bottom-1/4 left-8 w-8 h-8 bg-white/10 rounded-lg rotate-45 transition-all duration-500 group-hover:rotate-90" />
            </div>
            <div className="text-center text-white relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm mb-4 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 group-hover:bg-white/30">
                <BookOpen className="h-8 w-8" />
              </div>
              <p className="text-base font-semibold line-clamp-2 leading-tight px-2">{title}</p>
            </div>
          </div>
        )}

        {/* Top left: Semester badge */}
        {semester && (
          <div className="absolute top-4 left-4 transition-all duration-300 group-hover:scale-110">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-lg backdrop-blur-sm">
              <GraduationCap className="h-3.5 w-3.5" />
              <span>Sem {semester}</span>
            </div>
          </div>
        )}

        {/* Top right: Rating */}
        <div className="absolute top-4 right-4 transition-all duration-300 group-hover:scale-110">
          <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-foreground/80 backdrop-blur-sm text-background text-xs font-bold shadow-lg">
            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
            <span>{rating.toFixed(1)}</span>
          </div>
        </div>

        {/* Bottom info strip */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className={`transition-all duration-500 ${isHovered ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
            <h3 className="font-serif text-lg font-bold text-white line-clamp-2 drop-shadow-lg leading-tight mb-1">
              {title}
            </h3>
            <p className="text-white/80 text-sm font-medium">{author}</p>
          </div>
        </div>

        {/* Hover overlay content */}
        <div className={`absolute inset-0 flex flex-col items-center justify-center p-6 transition-all duration-500 ${
          isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}>
          {/* Quick action buttons */}
          <div className="flex items-center gap-3 mb-6">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className={`p-3.5 rounded-full shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 ${
                    isSaved 
                      ? 'bg-secondary text-secondary-foreground' 
                      : 'bg-white text-foreground hover:bg-white/90'
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSave();
                  }}
                >
                  <Heart className={`h-5 w-5 transition-all ${isSaved ? 'fill-current scale-110' : ''}`} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">{isSaved ? "Saved!" : "Save for later"}</TooltipContent>
            </Tooltip>

            {pdfUrl && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className="p-3.5 rounded-full bg-white text-foreground shadow-xl transition-all duration-300 hover:scale-110 hover:bg-white/90 active:scale-95"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    <Download className="h-5 w-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">Download PDF</TooltipContent>
              </Tooltip>
            )}
          </div>

          {/* View details button */}
          <button className="group/btn flex items-center gap-2 px-6 py-3 rounded-full bg-white text-foreground font-semibold shadow-2xl transition-all duration-300 hover:gap-4 hover:px-7 active:scale-95">
            <Eye className="h-4 w-4" />
            <span>View Details</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
          </button>
        </div>
      </div>

      {/* Content Section */}
      <CardHeader className="space-y-3 pb-2 pt-4">
        {/* Meta badges */}
        <div className="flex items-center gap-2 flex-wrap">
          {department && (
            <Badge variant="outline" className="font-sans text-2xs bg-muted/50 border-border/50 text-muted-foreground px-2 py-0.5 transition-colors hover:bg-muted">
              {department.replace('BS ', '')}
            </Badge>
          )}
          {courseCode && (
            <Badge className="font-sans text-2xs bg-primary/10 text-primary border-0 px-2 py-0.5 hover:bg-primary/20 transition-colors">
              {courseCode}
            </Badge>
          )}
          {publishedYear && (
            <Badge variant="outline" className="font-sans text-2xs border-border/50 text-muted-foreground px-2 py-0.5">
              <Calendar className="h-2.5 w-2.5 mr-1" />
              {publishedYear}
            </Badge>
          )}
        </div>

        {/* Description */}
        {description && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {description}
          </p>
        )}
      </CardHeader>

      <CardContent className="pt-0 space-y-3 pb-4">
        {/* Interactive rating section */}
        <div className="flex items-center justify-between py-2.5 px-3 bg-muted/40 rounded-xl transition-colors hover:bg-muted/60">
          <span className="text-xs text-muted-foreground font-medium">Rate this</span>
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleRate(star);
                }}
                className="transition-all duration-200 hover:scale-125 active:scale-90 p-1 group/star"
              >
                <Star
                  className={`h-4 w-4 transition-all duration-200 ${
                    star <= userRating
                      ? "fill-yellow-400 text-yellow-400 drop-shadow-sm"
                      : "text-muted-foreground/30 group-hover/star:text-yellow-400/60"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Action button */}
        <Button 
          className="w-full h-11 font-semibold transition-all duration-300 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border-0 group/explore overflow-hidden relative" 
          variant="outline"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-primary to-primary-glow opacity-0 group-hover/explore:opacity-100 transition-opacity duration-300" />
          <span className="relative flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4 transition-transform duration-300 group-hover/explore:rotate-12" />
            Explore Book
            <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 transition-all duration-300 group-hover/explore:opacity-100 group-hover/explore:translate-x-0" />
          </span>
        </Button>
      </CardContent>
    </Card>
  );
};