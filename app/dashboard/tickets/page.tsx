'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { DataTable, Column } from '@/components/data-table';
import { StatusBadge } from '@/components/status-badge';
import { ConfirmationDialog } from '@/components/confirmation-dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Ticket } from '@/lib/types';
import { get, markTicketUsed, expireTicket, validateTicket } from '@/lib/api';
import { formatDate, formatCurrency, truncate } from '@/lib/format';
import { useToast } from '@/hooks/use-toast';

export default function TicketsPage() {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'valid' | 'used' | 'expired'>('all');
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: 'use' | 'expire' | 'validate' | null;
    ticketId: string | null;
  }>({
    open: false,
    action: null,
    ticketId: null,
  });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      const data = await get<Ticket[]>('/tickets/');
      setTickets(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load tickets',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkUsed = (ticketId: string) => {
    setConfirmDialog({ open: true, action: 'use', ticketId });
  };

  const handleExpire = (ticketId: string) => {
    setConfirmDialog({ open: true, action: 'expire', ticketId });
  };

  const handleValidate = (ticketId: string) => {
    setConfirmDialog({ open: true, action: 'validate', ticketId });
  };

  const processTicketAction = async () => {
    if (!confirmDialog.ticketId || !confirmDialog.action) return;

    setIsProcessing(true);
    try {
      let actionFn;
      let actionLabel;

      switch (confirmDialog.action) {
        case 'use':
          actionFn = markTicketUsed;
          actionLabel = 'marked as used';
          break;
        case 'expire':
          actionFn = expireTicket;
          actionLabel = 'expired';
          break;
        case 'validate':
          actionFn = validateTicket;
          actionLabel = 'validated';
          break;
        default:
          return;
      }

      await actionFn(confirmDialog.ticketId);

      setTickets(prev =>
        prev.map(ticket =>
          ticket.id === confirmDialog.ticketId
            ? {
                ...ticket,
                status: confirmDialog.action === 'use' ? 'used' : confirmDialog.action === 'expire' ? 'expired' : 'valid',
                usedAt: confirmDialog.action === 'use' ? new Date().toISOString() : ticket.usedAt,
                canBeUsed: confirmDialog.action === 'expire' ? false : confirmDialog.action === 'validate' ? true : ticket.canBeUsed,
              }
            : ticket
        )
      );

      toast({
        title: 'Success',
        description: `Ticket ${actionLabel} successfully`,
      });

      setConfirmDialog({ open: false, action: null, ticketId: null });
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to update ticket status`,
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredTickets = tickets.filter(
    ticket => statusFilter === 'all' || ticket.status === statusFilter
  );

  const columns: Column<Ticket>[] = [
    {
      key: 'ticketNumber',
      label: 'Ticket Number',
      render: (number) => truncate(number, 20),
    },
    {
      key: 'firstName',
      label: 'Name',
      render: (_, item) => `${item.firstName} ${item.lastName}`,
    },
    {
      key: 'email',
      label: 'Email',
      render: (email) => truncate(email, 30),
    },
    {
      key: 'ticketType',
      label: 'Ticket Type',
      render: (ticketType) => ticketType?.name || '—',
    },
    {
      key: 'price',
      label: 'Price',
      render: (price, item) => formatCurrency(price, item.ticketType?.currency || 'USD'),
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
          <h1 className="text-3xl font-bold text-gray-900">Event Tickets</h1>
          <p className="text-gray-600 mt-1">Manage event ticket validations and states</p>
        </div>

        <Tabs defaultValue="all" onValueChange={(val) => setStatusFilter(val as any)}>
          <TabsList>
            <TabsTrigger value="all">All ({tickets.length})</TabsTrigger>
            <TabsTrigger value="valid">
              Valid ({tickets.filter(t => t.status === 'valid').length})
            </TabsTrigger>
            <TabsTrigger value="used">
              Used ({tickets.filter(t => t.status === 'used').length})
            </TabsTrigger>
            <TabsTrigger value="expired">
              Expired ({tickets.filter(t => t.status === 'expired').length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={statusFilter} className="mt-6">
            <DataTable
              columns={columns}
              data={filteredTickets}
              isLoading={isLoading}
              emptyMessage="No tickets found"
              actions={
                statusFilter === 'valid'
                  ? [
                      {
                        label: 'Mark Used',
                        onClick: (item) => handleMarkUsed(item.id),
                      },
                      {
                        label: 'Expire',
                        onClick: (item) => handleExpire(item.id),
                        className: 'text-orange-600 hover:text-orange-700',
                      },
                    ]
                  : statusFilter === 'expired'
                  ? [
                      {
                        label: 'Validate',
                        onClick: (item) => handleValidate(item.id),
                      },
                    ]
                  : undefined
              }
            />
          </TabsContent>
        </Tabs>

        <ConfirmationDialog
          open={confirmDialog.open}
          title="Confirm Ticket Action"
          description={
            confirmDialog.action === 'use'
              ? 'Mark this ticket as used?'
              : confirmDialog.action === 'expire'
              ? 'Expire this ticket?'
              : 'Validate this ticket?'
          }
          actionLabel={confirmDialog.action === 'use' ? 'Mark Used' : confirmDialog.action === 'expire' ? 'Expire' : 'Validate'}
          onConfirm={processTicketAction}
          onCancel={() => setConfirmDialog({ open: false, action: null, ticketId: null })}
          isLoading={isProcessing}
        />
      </div>
    </DashboardLayout>
  );
}
