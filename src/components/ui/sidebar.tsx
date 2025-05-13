
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ListCheck,
  LayoutDashboard,
  Users,
  FileText,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from './button';
import { useMobile } from '@/hooks/use-mobile';

export type SidebarItem = {
  title: string;
  href: string;
  icon: React.ReactNode;
  roles?: string[];
};

export const sidebarItems: SidebarItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />,
    roles: ['resident', 'admin', 'director'],
  },
  {
    title: 'Residents',
    href: '/residents',
    icon: <Users className="h-5 w-5" />,
    roles: ['resident', 'admin', 'director'],
  },
  {
    title: 'Finance',
    href: '/finance',
    icon: <FileText className="h-5 w-5" />,
    roles: ['resident', 'admin', 'director'],
  },
  {
    title: 'Documents',
    href: '/documents',
    icon: <FileText className="h-5 w-5" />,
    roles: ['resident', 'admin', 'director'],
  },
  {
    title: 'Messages',
    href: '/communication',
    icon: <MessageSquare className="h-5 w-5" />,
    roles: ['resident', 'admin', 'director'],
  },
  {
    title: 'Requests',
    href: '/requests',
    icon: <ListCheck className="h-5 w-5" />,
    roles: ['resident', 'admin', 'director'],
  },
  {
    title: 'Admin Panel',
    href: '/admin',
    icon: <Settings className="h-5 w-5" />,
    roles: ['admin'],
  },
];

interface SidebarProps {
  className?: string;
  userRole?: string;
}

export function Sidebar({ className, userRole = 'resident' }: SidebarProps) {
  const { toast } = useToast();
  const location = useLocation();
  const { isMobile } = useMobile();
  const [isOpen, setIsOpen] = useState(!isMobile);

  const filteredItems = sidebarItems.filter(
    (item) => !item.roles || item.roles.includes(userRole)
  );

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: 'Successfully signed out',
      });
    } catch (error) {
      toast({
        title: 'Error signing out',
        variant: 'destructive',
      });
    }
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50"
          onClick={toggleSidebar}
        >
          {isOpen ? <X /> : <Menu />}
        </Button>
      )}

      <div
        className={cn(
          'h-screen bg-background border-r flex flex-col transition-all duration-300',
          isMobile ? 'fixed z-40' : 'relative',
          isMobile && !isOpen ? '-translate-x-full' : 'translate-x-0',
          className
        )}
      >
        <div className="p-6">
          <h2 className="text-lg font-semibold">Condominium App</h2>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-1">
          {filteredItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center px-3 py-2 text-base rounded-md group hover:bg-muted',
                location.pathname === item.href
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'text-foreground'
              )}
            >
              {item.icon}
              <span className="ml-3">{item.title}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t">
          <Button
            variant="outline"
            className="w-full flex items-center"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </div>
      </div>
    </>
  );
}
