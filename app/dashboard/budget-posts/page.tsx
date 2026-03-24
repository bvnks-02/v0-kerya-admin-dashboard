'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { DataTable, Column } from '@/components/data-table';
import { StatusBadge } from '@/components/status-badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BudgetPost } from '@/lib/types';
import { get } from '@/lib/api';
import { formatCurrency, formatDate, truncate } from '@/lib/format';
import { useToast } from '@/hooks/use-toast';

export default function BudgetPostsPage() {
  const { toast } = useToast();
  const [posts, setPosts] = useState<BudgetPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'closed'>('all');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const data = await get<BudgetPost[]>('/budget-posts/');
      setPosts(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load budget posts',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPosts = posts.filter(
    post => statusFilter === 'all' || post.status === statusFilter
  );

  const columns: Column<BudgetPost>[] = [
    {
      key: 'title',
      label: 'Title',
      render: (title) => truncate(title, 40),
    },
    {
      key: 'guest',
      label: 'Guest',
      render: (_, item) => item.guest?.username || '—',
    },
    {
      key: 'wilaya',
      label: 'Location',
      render: (wilaya, item) => `${item.municipality}, ${wilaya}`,
    },
    {
      key: 'nights',
      label: 'Nights',
    },
    {
      key: 'budget_per_night',
      label: 'Budget/Night',
      render: (budget, item) => formatCurrency(budget, item.currency),
    },
    {
      key: 'budget_min',
      label: 'Budget Range',
      render: (min, item) => `${formatCurrency(min, item.currency)} - ${formatCurrency(item.budget_max, item.currency)}`,
    },
    {
      key: 'status',
      label: 'Status',
      render: (status) => <StatusBadge status={status} />,
    },
    {
      key: 'created_at',
      label: 'Posted',
      render: (date) => formatDate(date),
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Budget Posts</h1>
          <p className="text-gray-600 mt-1">Manage budget request postings</p>
        </div>

        <Tabs defaultValue="all" onValueChange={(val) => setStatusFilter(val as any)}>
          <TabsList>
            <TabsTrigger value="all">All ({posts.length})</TabsTrigger>
            <TabsTrigger value="active">
              Active ({posts.filter(p => p.status === 'active').length})
            </TabsTrigger>
            <TabsTrigger value="closed">
              Closed ({posts.filter(p => p.status === 'closed').length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={statusFilter} className="mt-6">
            <DataTable
              columns={columns}
              data={filteredPosts}
              isLoading={isLoading}
              emptyMessage="No budget posts found"
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
