"use client";

import { useState } from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable, SortableHeader } from "@/components/admin/data-table";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { formatPrice, formatDate } from "@/lib/formatters";
import { ORDER_STATUSES } from "@/lib/constants";
import type { Order } from "@/types/order";

type OrderWithEmail = Order & { customer_email: string };

const columns: ColumnDef<OrderWithEmail>[] = [
  {
    accessorKey: "order_number",
    header: ({ column }) => (
      <SortableHeader column={column}>Order</SortableHeader>
    ),
    cell: ({ row }) => (
      <Link
        href={`/admin/orders/${row.original.id}`}
        className="font-medium hover:underline"
      >
        {row.original.order_number}
      </Link>
    ),
  },
  {
    accessorKey: "customer_email",
    header: "Customer",
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <SortableHeader column={column}>Date</SortableHeader>
    ),
    cell: ({ row }) => formatDate(row.original.created_at),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <OrderStatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "total",
    header: ({ column }) => (
      <SortableHeader column={column}>Total</SortableHeader>
    ),
    cell: ({ row }) => (
      <span className="font-medium">{formatPrice(row.original.total)}</span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <Button variant="ghost" size="icon-xs" asChild>
        <Link href={`/admin/orders/${row.original.id}`}>
          <Eye className="size-4" />
          <span className="sr-only">View</span>
        </Link>
      </Button>
    ),
    enableSorting: false,
  },
];

function OrderMobileCard({ order }: { order: OrderWithEmail }) {
  return (
    <Link
      href={`/admin/orders/${order.id}`}
      className="block rounded-md border bg-card p-3"
    >
      <div className="flex items-center justify-between">
        <span className="font-medium">{order.order_number}</span>
        <OrderStatusBadge status={order.status} />
      </div>
      <div className="mt-1 flex items-center justify-between text-sm">
        <span className="min-w-0 truncate text-muted-foreground">
          {order.customer_email}
        </span>
        <span className="shrink-0 pl-2 font-medium">
          {formatPrice(order.total)}
        </span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        {formatDate(order.created_at)}
      </p>
    </Link>
  );
}

interface OrdersTableProps {
  orders: OrderWithEmail[];
}

export function OrdersTable({ orders }: OrdersTableProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered =
    statusFilter === "all"
      ? orders
      : orders.filter((o) => o.status === statusFilter);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-45">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {ORDER_STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <DataTable
        columns={columns}
        data={filtered}
        mobileCard={(order) => <OrderMobileCard order={order} />}
      />
    </div>
  );
}
