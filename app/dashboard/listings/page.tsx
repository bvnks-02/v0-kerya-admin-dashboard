'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { DataTable, Column } from '@/components/data-table';
import { StatusBadge } from '@/components/status-badge';
import { ConfirmationDialog } from '@/components/confirmation-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Listing } from '@/lib/types';
import { get, updateListingStatus } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/format';
import { useToast } from '@/hooks/use-toast';

export default function ListingsPage() {
  const { toast } = useToast();
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'pending'>('all');
  const [page, setPage] = useState(1);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: 'approve' | 'reject' | null;
    listingId: string | null;
  }>({
    open: false,
    action: null,
    listingId: null,
  });
  const [isProcessing, setIsProcessing] = useState(false);

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

  const handleApprove = (listingId: string) => {
    setConfirmDialog({ open: true, action: 'approve', listingId });
  };

  const handleReject = (listingId: string) => {
    setConfirmDialog({ open: true, action: 'reject', listingId });
  };

  const processListing = async () => {
    if (!confirmDialog.listingId || !confirmDialog.action) return;

    setIsProcessing(true);
    try {
      const newStatus = confirmDialog.action === 'approve' ? 'active' : 'inactive';
      await updateListingStatus(confirmDialog.listingId, newStatus);

      setListings(prev =>
        prev.map(listing =>
          listing.id === confirmDialog.listingId
            ? {
                ...listing,
                status: newStatus,
              }
            : listing
        )
      );

      toast({
        title: 'Success',
        description: `Listing ${confirmDialog.action === 'approve' ? 'approved' : 'rejected'} successfully`,
      });

      setConfirmDialog({ open: false, action: null, listingId: null });
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${confirmDialog.action} listing`,
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
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
      key: 'type',
      label: 'Type',
    },
    {
      key: 'wilaya',
      label: 'Location',
      render: (wilaya, item) => `${item.municipality}, ${wilaya}`,
    },
    {
      key: 'detail',
      label: 'Rooms/Baths',
      render: (_, item) => `${item.detail?.rooms || 0}/${item.detail?.bathrooms || 0}`,
    },
    {
      key: 'capacity',
      label: 'Capacity',
      render: (capacity) => `${capacity} guests`,
    },
    {
      key: 'detail',
      label: 'Price/Night',
      render: (_, item) => formatCurrency(item.detail?.price_per_night || 0, 'DZD'),
    },
    {
      key: 'status',
      label: 'Status',
      render: (status) => <StatusBadge status={status} />,
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (date) => formatDate(date),
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Listings</h1>
          <p className="text-gray-600 mt-1">Review and manage all property listings</p>
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
              actions={[
                {
                  label: 'Approve',
                  onClick: (item) => handleApprove(item.id),
                },
                {
                  label: 'Reject',
                  onClick: (item) => handleReject(item.id),
                  className: 'text-red-600 hover:text-red-700',
                },
              ]}
              pagination={{
                current: page,
                total: Math.ceil(listings.length / 10),
                onChange: setPage,
              }}
            />
          </TabsContent>
        </Tabs>

        <ConfirmationDialog
          open={confirmDialog.open}
          title="Confirm Listing Action"
          description={
            confirmDialog.action === 'approve'
              ? 'Approve this listing? It will be published and visible to users.'
              : 'Reject this listing? The owner will be notified.'
          }
          actionLabel={confirmDialog.action === 'approve' ? 'Approve' : 'Reject'}
          isDestructive={confirmDialog.action === 'reject'}
          onConfirm={processListing}
          onCancel={() => setConfirmDialog({ open: false, action: null, listingId: null })}
          isLoading={isProcessing}
        />
      </div>
    </DashboardLayout>
  );
}
