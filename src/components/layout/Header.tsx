import { ChevronDown, LogOut } from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

export default function Header() {
  const { logout } = useAuthContext();
  const { data: currentUser, isLoading, error } = useCurrentUser();

  const handleLogout = async () => {
    await logout();
  };

  const getUserInitials = () => {
    if (currentUser?.fullName?.trim()) {
      return currentUser.fullName
        .trim()
        .split(' ')
        .filter(n => n.length > 0)
        .map(n => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
    }
    return currentUser?.email?.[0]?.toUpperCase() || 'U';
  };

  const getDisplayName = () => {
    return currentUser?.fullName || currentUser?.email || 'Usuario';
  };

  if (error) {
    console.error('Error loading user data:', error);
    return (
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <img src={logo} alt="AWBL Logo" className="h-10 w-auto" />
        </div>
        <Button variant="ghost" onClick={handleLogout}>
          Cerrar sesión
        </Button>
      </header>
    );
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center">
        <img src={logo} alt="AWBL Logo" className="h-10 w-auto" />
      </div>

      <div className="flex items-center">
        {isLoading ? (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
          </div>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center space-x-3 hover:bg-gray-50 px-3 py-2 rounded-lg"
              >
                <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-semibold">
                  {getUserInitials()}
                </div>

                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium text-gray-900">
                    {getDisplayName()}
                  </span>
                </div>

                <ChevronDown className="w-4 h-4 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-40 bg-white border border-gray-200 shadow-lg">
              <DropdownMenuItem 
                onClick={handleLogout}
                variant="destructive"
                className="cursor-pointer"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
