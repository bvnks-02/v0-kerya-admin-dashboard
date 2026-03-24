'use client';

import { useEffect, useState } from 'react';
import { BarChart3, FileText, Users, Zap } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { StatCard } from '@/components/stat-card';
import { Card } from '@/components/ui/card';
import { AdminUserStats } from '@/lib/types';
import { getUserStats } from '@/lib/api';

export default function DashboardPage() {
  const [stats, setStats] = useState<AdminUserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getUserStats<AdminUserStats>();
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
              value={stats.total_users}
              icon={Users}
              trend={{ value: stats.active_users - stats.inactive_users, isPositive: true }}
            />
            <StatCard
              title="Active Users"
              value={stats.active_users}
              icon={FileText}
              trend={{ value: stats.email_verified, isPositive: true }}
            />
            <StatCard
              title="Host Users"
              value={stats.by_role.host}
              icon={Zap}
              trend={{ value: stats.by_role.guest, isPositive: true }}
            />
            <StatCard
              title="Email Verified"
              value={stats.email_verified}
              icon={BarChart3}
              trend={{ value: stats.phone_verified, isPositive: true }}
            />
          </div>
        ) : null}

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Users by Role</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Admin</span>
                  <span className="font-semibold">{stats.by_role.admin}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Hosts</span>
                  <span className="font-semibold">{stats.by_role.host}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Guests</span>
                  <span className="font-semibold">{stats.by_role.guest}</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Verification Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Email Verified</span>
                  <span className="font-semibold">{stats.email_verified}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Phone Verified</span>
                  <span className="font-semibold">{stats.phone_verified}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Not Verified</span>
                  <span className="font-semibold">{stats.total_users - stats.email_verified}</span>
                </div>
              </div>
            </Card>
          </div>
        )}

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
