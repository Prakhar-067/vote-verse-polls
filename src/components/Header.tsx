
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { BarChart3, LogOut, User } from "lucide-react";

const Header = () => {
  const { currentUser, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-poll-primary" />
          <h1 className="text-xl font-bold text-poll-primary">Vote-Verse</h1>
        </div>
        
        {currentUser && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {currentUser.name}
                {currentUser.isAdmin && (
                  <span className="ml-2 px-2 py-0.5 bg-poll-primary/10 text-poll-primary text-xs rounded-full">
                    Admin
                  </span>
                )}
              </span>
            </div>
            
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" /> 
              Sign Out
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
