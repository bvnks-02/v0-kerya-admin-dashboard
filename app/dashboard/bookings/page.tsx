'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { DataTable, Column } from '@/components/data-table';
import { StatusBadge } from '@/components/status-badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Booking } from '@/lib/types';
import { get } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/format';
import { useToast } from '@/hooks/use-toast';

export default function BookingsPage() {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const data = await get<Booking[]>('/bookings');
      setBookings(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load bookings',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBookings = bookings.filter(
    booking => statusFilter === 'all' || booking.status === statusFilter
  );

  const columns: Column<Booking>[] = [
    {
      key: 'id',
      label: 'Booking ID',
      render: (id) => `#${String(id).slice(0, 8)}`,
    },
    {
      key: 'listingId',
      label: 'Listing',
      render: (id) => `Listing ${String(id).slice(0, 8)}`,
    },
    {
      key: 'checkIn',
      label: 'Check-in',
      render: (date) => formatDate(date),
    },
    {
      key: 'checkOut',
      label: 'Check-out',
      render: (date) => formatDate(date),
    },
    {
      key: 'totalPrice',
      label: 'Total',
      render: (price, item) => formatCurrency(price, item.currency),
    },
    {
      key: 'status',
      label: 'Status',
      render: (status) => <StatusBadge status={status} />,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bookings</h1>
          <p className="text-gray-600 mt-1">View and manage all property bookings</p>
        </div>

        <Tabs defaultValue="all" onValueChange={(val) => setStatusFilter(val as any)}>
          <TabsList>
            <TabsTrigger value="all">All ({bookings.length})</TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({bookings.filter(b => b.status === 'pending').length})
            </TabsTrigger>
            <TabsTrigger value="confirmed">
              Confirmed ({bookings.filter(b => b.status === 'confirmed').length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({bookings.filter(b => b.status === 'completed').length})
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              Cancelled ({bookings.filter(b => b.status === 'cancelled').length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={statusFilter} className="mt-6">
            <DataTable
              columns={columns}
              data={filteredBookings}
              isLoading={isLoading}
              emptyMessage="No bookings found"
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
