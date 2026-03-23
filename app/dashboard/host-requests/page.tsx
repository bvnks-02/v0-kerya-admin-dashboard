'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { DataTable, Column } from '@/components/data-table';
import { StatusBadge } from '@/components/status-badge';
import { ConfirmationDialog } from '@/components/confirmation-dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HostRequest } from '@/lib/types';
import { get, patch } from '@/lib/api';
import { formatDate, formatPhoneNumber } from '@/lib/format';
import { useToast } from '@/hooks/use-toast';

export default function HostRequestsPage() {
  const { toast } = useToast();
  const [requests, setRequests] = useState<HostRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: 'approve' | 'reject' | null;
    requestId: string | null;
  }>({
    open: false,
    action: null,
    requestId: null,
  });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const data = await get<HostRequest[]>('/host-requests');
      setRequests(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load host requests',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    setConfirmDialog({ open: true, action: 'approve', requestId });
  };

  const handleReject = async (requestId: string) => {
    setConfirmDialog({ open: true, action: 'reject', requestId });
  };

  const processRequest = async () => {
    if (!confirmDialog.requestId || !confirmDialog.action) return;

    setIsProcessing(true);
    try {
      await patch(`/host-requests/${confirmDialog.requestId}`, {
        status: confirmDialog.action === 'approve' ? 'approved' : 'rejected',
      });

      setRequests(prev =>
        prev.map(req =>
          req.id === confirmDialog.requestId
            ? {
                ...req,
                status: confirmDialog.action === 'approve' ? 'approved' : 'rejected',
              }
            : req
        )
      );

      toast({
        title: 'Success',
        description: `Request ${confirmDialog.action === 'approve' ? 'approved' : 'rejected'} successfully`,
      });

      setConfirmDialog({ open: false, action: null, requestId: null });
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${confirmDialog.action} request`,
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredRequests = requests.filter(
    req => statusFilter === 'all' || req.status === statusFilter
  );

  const columns: Column<HostRequest>[] = [
    {
      key: 'firstName',
      label: 'Name',
      render: (_, item) => `${item.firstName} ${item.lastName}`,
    },
    {
      key: 'email',
      label: 'Email',
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (phone) => formatPhoneNumber(phone),
    },
    {
      key: 'wilaya',
      label: 'Wilaya',
    },
    {
      key: 'status',
      label: 'Status',
      render: (status) => <StatusBadge status={status} />,
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (date) => formatDate(date),
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Host Requests</h1>
          <p className="text-gray-600 mt-1">Review and manage host registration requests</p>
        </div>

        <Tabs defaultValue="all" onValueChange={(val) => setStatusFilter(val as any)}>
          <TabsList>
            <TabsTrigger value="all">All ({requests.length})</TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({requests.filter(r => r.status === 'pending').length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved ({requests.filter(r => r.status === 'approved').length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected ({requests.filter(r => r.status === 'rejected').length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={statusFilter} className="mt-6">
            <DataTable
              columns={columns}
              data={filteredRequests}
              isLoading={isLoading}
              emptyMessage="No host requests found"
              actions={
                statusFilter === 'pending'
                  ? [
                      {
                        label: 'Approve',
                        onClick: (item) => handleApprove(item.id),
                      },
                      {
                        label: 'Reject',
                        onClick: (item) => handleReject(item.id),
                        className: 'text-red-600 hover:text-red-700',
                      },
                    ]
                  : undefined
              }
            />
          </TabsContent>
        </Tabs>
      </div>

      <ConfirmationDialog
        open={confirmDialog.open}
        title={
          confirmDialog.action === 'approve'
            ? 'Approve Host Request?'
            : 'Reject Host Request?'
        }
        description={
          confirmDialog.action === 'approve'
            ? 'This will send an approval email to the applicant and activate their host account.'
            : 'This will send a rejection email to the applicant. This action cannot be undone.'
        }
        actionLabel={confirmDialog.action === 'approve' ? 'Approve' : 'Reject'}
        isDestructive={confirmDialog.action === 'reject'}
        isLoading={isProcessing}
        onConfirm={processRequest}
        onCancel={() => setConfirmDialog({ open: false, action: null, requestId: null })}
      />
    </DashboardLayout>
  );
}
