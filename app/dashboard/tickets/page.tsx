'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { DataTable, Column } from '@/components/data-table';
import { StatusBadge } from '@/components/status-badge';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Ticket } from '@/lib/types';
import { get } from '@/lib/api';
import { formatDate, truncate, getStatusColor } from '@/lib/format';
import { useToast } from '@/hooks/use-toast';

export default function TicketsPage() {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'in-progress' | 'resolved' | 'closed'>('all');

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

  const filteredTickets = tickets.filter(
    ticket => statusFilter === 'all' || ticket.status === statusFilter
  );

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      low: 'outline',
      medium: 'secondary',
      high: 'destructive',
      critical: 'destructive',
    };
    return colors[priority] || 'outline';
  };

  const columns: Column<Ticket>[] = [
    {
      key: 'title',
      label: 'Title',
      render: (title) => truncate(title, 40),
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (priority) => (
        <Badge variant={getPriorityColor(priority)}>
          {priority.charAt(0).toUpperCase() + priority.slice(1)}
        </Badge>
      ),
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
          <h1 className="text-3xl font-bold text-gray-900">Support Tickets</h1>
          <p className="text-gray-600 mt-1">Manage customer support tickets</p>
        </div>

        <Tabs defaultValue="all" onValueChange={(val) => setStatusFilter(val as any)}>
          <TabsList>
            <TabsTrigger value="all">All ({tickets.length})</TabsTrigger>
            <TabsTrigger value="open">
              Open ({tickets.filter(t => t.status === 'open').length})
            </TabsTrigger>
            <TabsTrigger value="in-progress">
              In Progress ({tickets.filter(t => t.status === 'in-progress').length})
            </TabsTrigger>
            <TabsTrigger value="resolved">
              Resolved ({tickets.filter(t => t.status === 'resolved').length})
            </TabsTrigger>
            <TabsTrigger value="closed">
              Closed ({tickets.filter(t => t.status === 'closed').length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={statusFilter} className="mt-6">
            <DataTable
              columns={columns}
              data={filteredTickets}
              isLoading={isLoading}
              emptyMessage="No tickets found"
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
