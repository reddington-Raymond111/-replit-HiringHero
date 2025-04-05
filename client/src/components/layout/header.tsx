import { useState } from 'react';
import { Menu, Bell } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import Sidebar from "./sidebar";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="bg-white border-b border-neutral-200">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6">
          <button 
            type="button" 
            className="md:hidden text-neutral-500 hover:text-neutral-600"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center md:hidden">
            <h1 className="text-xl font-semibold text-primary">TalentHub</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="text-neutral-500 hover:text-neutral-600">
              <Bell className="h-5 w-5" />
            </Button>
            <div className="relative">
              <button type="button" className="flex items-center max-w-xs text-sm rounded-full md:hidden">
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary">
                  <span className="text-xs font-medium">SA</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <Sidebar />
        </SheetContent>
      </Sheet>
    </>
  );
}
