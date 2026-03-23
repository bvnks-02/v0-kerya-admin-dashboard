import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface Column<T> {
  key: keyof T;
  label: string;
  render?: (value: any, item: T) => React.ReactNode;
  className?: string;
  hidden?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyMessage?: string;
  pagination?: {
    current: number;
    total: number;
    onChange: (page: number) => void;
  };
  actions?: {
    label: string;
    onClick: (item: T) => void;
    className?: string;
  }[];
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  isLoading = false,
  isEmpty = false,
  emptyMessage = 'No data available',
  pagination,
  actions,
}: DataTableProps<T>) {
  const visibleColumns = columns.filter(col => !col.hidden);

  if (isLoading) {
    return (
      <Card>
        <div className="p-8 text-center">
          <div className="inline-block animate-spin">
            <div className="w-6 h-6 border-2 border-amber-600 border-t-transparent rounded-full" />
          </div>
          <p className="text-gray-600 mt-2">Loading...</p>
        </div>
      </Card>
    );
  }

  if (isEmpty || data.length === 0) {
    return (
      <Card>
        <div className="p-8 text-center">
          <p className="text-gray-600">{emptyMessage}</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                {visibleColumns.map(col => (
                  <th
                    key={String(col.key)}
                    className="px-6 py-3 text-left text-sm font-semibold text-gray-900"
                  >
                    {col.label}
                  </th>
                ))}
                {actions && <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  {visibleColumns.map(col => (
                    <td
                      key={String(col.key)}
                      className={cn('px-6 py-4 text-sm text-gray-600', col.className)}
                    >
                      {col.render
                        ? col.render(item[col.key], item)
                        : String(item[col.key])}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-6 py-4 text-right space-x-2 flex justify-end">
                      {actions.map(action => (
                        <Button
                          key={action.label}
                          size="sm"
                          variant="outline"
                          className={action.className}
                          onClick={() => action.onClick(item)}
                        >
                          {action.label}
                        </Button>
                      ))}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {pagination && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Page {pagination.current} of {pagination.total}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.current === 1}
              onClick={() => pagination.onChange(pagination.current - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.current === pagination.total}
              onClick={() => pagination.onChange(pagination.current + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
