import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ExplorePage from "./pages/ExplorePage";
import CategoriesPage from "./pages/CategoriesPage";
import CompanyDetailPage from "./pages/CompanyDetailPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import ComparePage from "./pages/ComparePage";
import SkillsPage from "./pages/SkillsPage";
import InnovexPage from "./pages/InnovexPage";
import JobHoldingsPage from "./pages/JobHoldingsPage";
import GeneratePage from "./pages/GeneratePage";
import RoadmapPage from "./pages/RoadmapPage";
import OfferOptimizerPage from "./pages/OfferOptimizerPage";
import InterviewVaultPage from "./pages/InterviewVaultPage";
import ResumeATSPage from "./pages/ResumeATSPage";
import ProfessionalPresencePage from "./pages/ProfessionalPresencePage";
import CompanyUpdateTrackerPage from "./pages/CompanyUpdateTrackerPage";
import CompanyIntelligencePage from "./pages/CompanyIntelligencePage";
import StudentProfilePage from "./pages/StudentProfilePage";
import RecruiterDashboardPage from "./pages/RecruiterDashboardPage";
import CareerHubPage from "./pages/CareerHubPage";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./components/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import DeveloperDashboardPage from "./pages/DeveloperDashboardPage";

const queryClient = new QueryClient();

const App = () => (
  <AuthProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            
            {/* General Protected Routes (Students, Admins, Developers) */}
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/explore" element={<ProtectedRoute><ExplorePage /></ProtectedRoute>} />
            <Route path="/categories" element={<ProtectedRoute><CategoriesPage /></ProtectedRoute>} />
            <Route path="/company/:id" element={<ProtectedRoute><CompanyDetailPage /></ProtectedRoute>} />
            <Route path="/compare" element={<ProtectedRoute><ComparePage /></ProtectedRoute>} />
            <Route path="/skills" element={<ProtectedRoute><SkillsPage /></ProtectedRoute>} />
            <Route path="/innovex" element={<ProtectedRoute><InnovexPage /></ProtectedRoute>} />
            <Route path="/job-holdings" element={<ProtectedRoute><JobHoldingsPage /></ProtectedRoute>} />
            <Route path="/roadmap" element={<ProtectedRoute><RoadmapPage /></ProtectedRoute>} />
            <Route path="/interview-vault" element={<ProtectedRoute><InterviewVaultPage /></ProtectedRoute>} />
            <Route path="/company-update-tracker" element={<ProtectedRoute><CompanyUpdateTrackerPage /></ProtectedRoute>} />
            <Route path="/company-intelligence" element={<ProtectedRoute><CompanyIntelligencePage /></ProtectedRoute>} />
            <Route path="/career-hub" element={<ProtectedRoute><CareerHubPage /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />

            {/* Student Specific Routes */}
            <Route path="/student-profile" element={<ProtectedRoute allowedRoles={["student"]}><StudentProfilePage /></ProtectedRoute>} />
            <Route path="/resume-ats" element={<ProtectedRoute allowedRoles={["student"]}><ResumeATSPage /></ProtectedRoute>} />
            <Route path="/professional-presence" element={<ProtectedRoute allowedRoles={["student"]}><ProfessionalPresencePage /></ProtectedRoute>} />
            <Route path="/offer-optimizer" element={<ProtectedRoute allowedRoles={["student"]}><OfferOptimizerPage /></ProtectedRoute>} />

            {/* Admin & Developer Specific Routes */}
            <Route path="/generate" element={<ProtectedRoute allowedRoles={["admin", "developer"]}><GeneratePage /></ProtectedRoute>} />
            <Route path="/recruiter-dashboard" element={<ProtectedRoute allowedRoles={["admin", "developer"]}><RecruiterDashboardPage /></ProtectedRoute>} />

            {/* Hidden Developer Access Only */}
            <Route path="/developer-dashboard" element={<ProtectedRoute allowedRoles={["developer"]}><DeveloperDashboardPage /></ProtectedRoute>} />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </AuthProvider>
);

export default App;
