'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  BarChart3,
  FileText,
  Home,
  LogOut,
  Menu,
  MessageSquare,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { clearTokens } from '@/lib/api';

const navigation = [
  { name: 'Dashboard', href: '/dashboard/', icon: Home },
  { name: 'Host Requests', href: '/dashboard/host-requests/', icon: Zap },
  { name: 'Listings', href: '/dashboard/listings/', icon: FileText },
  { name: 'Bookings', href: '/dashboard/bookings/', icon: BarChart3 },
  { name: 'Budget Posts', href: '/dashboard/budget-posts/', icon: MessageSquare },
  { name: 'Support Tickets', href: '/dashboard/tickets/', icon: FileText },
  { name: 'Users', href: '/dashboard/users/', icon: Users },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    clearTokens();
    router.push('/login/');
  };

  const NavLink = ({ href, name, icon: Icon }: (typeof navigation)[0]) => {
    const isActive = pathname === href || (href !== '/dashboard/' && pathname.startsWith(href));
    return (
      <Link
        href={href}
        onClick={() => setIsOpen(false)}
        className={cn(
          'flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors',
          isActive
            ? 'bg-amber-100 text-amber-900'
            : 'text-gray-700 hover:bg-gray-100'
        )}
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
        <span>{name}</span>
      </Link>
    );
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="fixed top-0 left-0 right-0 z-40 md:hidden bg-white border-b border-gray-200">
        <div className="flex items-center justify-between h-16 px-4">
          <h1 className="text-xl font-bold text-amber-600">Kerya Admin</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-screen w-64 bg-slate-900 text-white flex flex-col transition-transform duration-300 z-50 md:z-0',
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-700">
          <div>
            <h1 className="text-xl font-bold text-amber-400">Kerya</h1>
            <p className="text-xs text-slate-400">Admin Panel</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-2">
          {navigation.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </nav>

        {/* Logout */}
        <div className="border-t border-slate-700 p-4">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-red-400 hover:text-red-300 hover:bg-red-950"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </Button>
        </div>
      </aside>

      {/* Sidebar overlay on mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
