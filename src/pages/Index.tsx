
import { useAuth } from "@/context/AuthContext";
import LoginForm from "@/components/LoginForm";
import Dashboard from "@/pages/Dashboard";

const Index = () => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse-light">
          <div className="h-12 w-48 bg-gray-200 rounded-md mb-4"></div>
          <div className="h-4 w-64 bg-gray-200 rounded-md"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      {isAuthenticated ? <Dashboard /> : (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-poll-background to-background">
          <div className="text-center max-w-md w-full">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-poll-primary mb-2">Vote-Verse</h1>
              <p className="text-lg text-muted-foreground">Real-time polling application</p>
            </div>
            <LoginForm />
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
