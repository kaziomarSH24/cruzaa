/**
 * Newsletter Management Page
 * Manage newsletter subscribers
 */

import React, { useState, useEffect } from "react";
import {
  Mail,
  Search,
  Trash2,
  Download,
  Calendar,
  MoreVertical,
  Users,
  AlertTriangle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import newsletterService from "@/services/newsletterService";
import { toast } from "sonner";
import { format } from "date-fns";

interface Subscriber {
  email: string;
  status: "active" | "unsubscribed";
  subscribed_at: string;
}

export default function NewsletterManagementPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filteredSubscribers, setFilteredSubscribers] = useState<Subscriber[]>(
    [],
  );

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const res = await newsletterService.getSubscribers();
      setSubscribers(res);
      setFilteredSubscribers(res);
    } catch (e) {
      toast.error("Failed to load subscribers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  useEffect(() => {
    const filtered = subscribers.filter((sub) =>
      sub.email.toLowerCase().includes(search.toLowerCase()),
    );
    setFilteredSubscribers(filtered);
  }, [search, subscribers]);

  const handleUnsubscribe = async (email: string) => {
    if (!confirm(`Unsubscribe ${email}?`)) return;
    try {
      await newsletterService.unsubscribe(email);
      toast.success("Unsubscribed successfully");
      fetchSubscribers();
    } catch (e) {
      toast.error("Failed to unsubscribe");
    }
  };

  const handleExport = () => {
    const csv = subscribers
      .map((sub) => `${sub.email},${sub.status},${sub.subscribed_at}`)
      .join("\n");

    const header = "email,status,subscribed_at\n";
    const data = header + csv;

    const blob = new Blob([data], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `newsletter_subscribers_${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported successfully");
  };

  const activeCount = subscribers.filter((s) => s.status === "active").length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Newsletter
          </h1>
          <p className="text-slate-500 text-sm">
            Manage newsletter subscribers
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium">
                  Total Subscribers
                </p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {subscribers.length}
                </p>
              </div>
              <Users className="h-12 w-12 text-blue-100" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium">Active</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {activeCount}
                </p>
              </div>
              <Mail className="h-12 w-12 text-green-100" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium">
                  Unsubscribed
                </p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {subscribers.length - activeCount}
                </p>
              </div>
              <AlertTriangle className="h-12 w-12 text-orange-100" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subscribers Table */}
      <Card>
        <CardHeader className="p-4 bg-slate-50/50 border-b">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by email..."
              className="pl-9 bg-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Subscribed Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell
                      colSpan={4}
                      className="h-12 animate-pulse bg-slate-50/50"
                    ></TableCell>
                  </TableRow>
                ))
              ) : filteredSubscribers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-12 text-slate-400"
                  >
                    No subscribers found
                  </TableCell>
                </TableRow>
              ) : (
                filteredSubscribers.map((subscriber) => (
                  <TableRow
                    key={subscriber.email}
                    className="hover:bg-slate-50/50"
                  >
                    <TableCell className="font-medium text-slate-900">
                      {subscriber.email}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          subscriber.status === "active"
                            ? "default"
                            : "secondary"
                        }
                        className={
                          subscriber.status === "active"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-700"
                        }
                      >
                        {subscriber.status === "active"
                          ? "Active"
                          : "Unsubscribed"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm">
                      {format(
                        new Date(subscriber.subscribed_at),
                        "MMM d, yyyy",
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {subscriber.status === "active" && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleUnsubscribe(subscriber.email)
                              }
                              className="text-red-600 cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Unsubscribe
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => {
                              navigator.clipboard.writeText(subscriber.email);
                              toast.success("Email copied");
                            }}
                            className="cursor-pointer"
                          >
                            <Mail className="h-4 w-4 mr-2" />
                            Copy Email
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
