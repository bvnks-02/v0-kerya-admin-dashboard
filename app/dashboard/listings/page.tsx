'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { DataTable, Column } from '@/components/data-table';
import { StatusBadge } from '@/components/status-badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Listing } from '@/lib/types';
import { get } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/format';
import { useToast } from '@/hooks/use-toast';

export default function ListingsPage() {
  const { toast } = useToast();
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'pending'>('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchListings();
  }, [page]);

  const fetchListings = async () => {
    try {
      setIsLoading(true);
      const data = await get<Listing[]>(`/listings/?page=${page}`);
      setListings(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load listings',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredListings = listings.filter(
    listing => statusFilter === 'all' || listing.status === statusFilter
  );

  const columns: Column<Listing>[] = [
    {
      key: 'title',
      label: 'Title',
    },
    {
      key: 'location',
      label: 'Location',
    },
    {
      key: 'bedrooms',
      label: 'Beds/Baths',
      render: (_, item) => `${item.bedrooms}/${item.bathrooms}`,
    },
    {
      key: 'price',
      label: 'Price',
      render: (price, item) => formatCurrency(price, item.currency),
    },
    {
      key: 'status',
      label: 'Status',
      render: (status) => <StatusBadge status={status} />,
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (date) => formatDate(date),
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Listings</h1>
          <p className="text-gray-600 mt-1">Manage all property listings</p>
        </div>

        <Tabs defaultValue="all" onValueChange={(val) => setStatusFilter(val as any)}>
          <TabsList>
            <TabsTrigger value="all">All ({listings.length})</TabsTrigger>
            <TabsTrigger value="active">
              Active ({listings.filter(l => l.status === 'active').length})
            </TabsTrigger>
            <TabsTrigger value="inactive">
              Inactive ({listings.filter(l => l.status === 'inactive').length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({listings.filter(l => l.status === 'pending').length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={statusFilter} className="mt-6">
            <DataTable
              columns={columns}
              data={filteredListings}
              isLoading={isLoading}
              emptyMessage="No listings found"
              pagination={{
                current: page,
                total: Math.ceil(listings.length / 10),
                onChange: setPage,
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
