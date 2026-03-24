'use client';

import { useEffect, useState } from 'react';
import { BarChart3, FileText, Users, Zap } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { StatCard } from '@/components/stat-card';
import { Card } from '@/components/ui/card';
import { DashboardStats } from '@/lib/types';
import { get } from '@/lib/api';
import { formatCurrency } from '@/lib/format';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await get<DashboardStats>('/dashboard/stats/');
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back to Kerya Admin</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="h-32 bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Users"
              value={stats.totalUsers}
              icon={Users}
              trend={{ value: 12, isPositive: true }}
            />
            <StatCard
              title="Active Listings"
              value={stats.activeListings}
              icon={FileText}
              trend={{ value: 8, isPositive: true }}
            />
            <StatCard
              title="Pending Requests"
              value={stats.pendingHostRequests}
              icon={Zap}
              trend={{ value: 5, isPositive: false }}
            />
            <StatCard
              title="Monthly Bookings"
              value={stats.monthlyBookings}
              icon={BarChart3}
              trend={{ value: 15, isPositive: true }}
            />
          </div>
        ) : null}

        <Card className="p-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">Total Revenue</h2>
            <p className="text-3xl font-bold text-amber-600 mt-2">
              {stats ? formatCurrency(stats.totalRevenue, stats.currency) : 'Loading...'}
            </p>
          </div>
        </Card>

        <Card className="p-8 bg-blue-50 border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">Getting Started</h3>
          <p className="text-sm text-blue-800">
            Navigate through the sidebar to manage host requests, listings, bookings, and more. All data is synced in real-time.
          </p>
        </Card>
      </div>
    </DashboardLayout>
  );
}
