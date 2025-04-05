import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  Calendar,
  Database, 
  UserPlus, 
  BarChartBig, 
  Settings, 
  HelpCircle 
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Job Postings", href: "/jobs", icon: Briefcase },
  { name: "Candidates", href: "/candidates", icon: Users },
  { name: "Interviews", href: "/interviews", icon: Calendar },
  { name: "Talent Pool", href: "/talent-pool", icon: Database },
  { name: "Onboarding", href: "/onboarding", icon: UserPlus },
  { name: "Analytics", href: "/analytics", icon: BarChartBig },
];

const secondaryNavigation = [
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Help & Support", href: "/support", icon: HelpCircle },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 bg-white border-r border-neutral-200">
        <div className="flex items-center justify-center h-16 px-4 border-b border-neutral-200">
          <h1 className="text-xl font-semibold text-primary">TalentHub</h1>
        </div>
        <div className="flex flex-col flex-grow px-4 py-4 overflow-y-auto">
          <div className="space-y-4">
            {/* User info */}
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary">
                <span className="text-sm font-medium">SA</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">Sarah Anderson</p>
                <p className="text-xs text-muted-foreground">HR Specialist</p>
              </div>
            </div>
            
            {/* Navigation */}
            <nav className="space-y-1">
              {navigation.map((item) => (
                <Link 
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                    location === item.href 
                      ? "bg-primary-50 text-primary"
                      : "text-neutral-700 hover:bg-neutral-50"
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>
            
            {/* Settings */}
            <div className="pt-4 mt-6 border-t border-neutral-200">
              {secondaryNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-neutral-700 hover:bg-neutral-50"
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
