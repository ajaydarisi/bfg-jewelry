"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  target_type: string;
  target_value: string | null;
  status: string;
  sent_count: number;
  failed_count: number;
  sent_at: string | null;
  created_at: string;
}

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800",
  sending: "bg-yellow-100 text-yellow-800",
  sent: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
};

const typeLabels: Record<string, string> = {
  custom: "Custom",
  promotion: "Promotion",
  order_update: "Order Update",
  price_drop: "Price Drop",
  back_in_stock: "Back in Stock",
};

const targetLabels: Record<string, string> = {
  all: "All Users",
  user: "Specific User",
  topic: "Topic",
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function NotificationsTable({
  notifications,
}: {
  notifications: Notification[];
}) {
  if (notifications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notification History</CardTitle>
          <CardDescription>No notifications sent yet</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification History</CardTitle>
        <CardDescription>
          {notifications.length} notification{notifications.length !== 1 && "s"}{" "}
          sent
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Sent</TableHead>
                <TableHead className="text-right">Failed</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notifications.map((n) => (
                <TableRow key={n.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{n.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {n.body}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {typeLabels[n.type] || n.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {targetLabels[n.target_type] || n.target_type}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        statusColors[n.status] || ""
                      }`}
                    >
                      {n.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">{n.sent_count}</TableCell>
                  <TableCell className="text-right">
                    {n.failed_count}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(n.sent_at || n.created_at)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
