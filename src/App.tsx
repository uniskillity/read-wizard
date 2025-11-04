import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import BookDetails from "./pages/BookDetails";
import SavedBooks from "./pages/SavedBooks";
import ReadingHistory from "./pages/ReadingHistory";
import Recommendations from "./pages/Recommendations";
import Trending from "./pages/Trending";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import Reports from "./pages/Reports";
import MyBooks from "./pages/MyBooks";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/book/:id" element={<BookDetails />} />
          <Route path="/saved" element={<SavedBooks />} />
          <Route path="/history" element={<ReadingHistory />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/trending" element={<Trending />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/my-books" element={<MyBooks />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
