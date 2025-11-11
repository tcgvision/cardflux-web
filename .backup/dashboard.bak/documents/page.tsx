"use client";

import { FileText, Upload, Folder, Search, Calendar } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";

export default function DocumentsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Documents</h1>
          <p className="text-muted-foreground">
            Manage your shop documents and files
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
          <Button>
            <Upload className="mr-2 h-4 w-4" />
            Upload Document
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex gap-2">
        <Input placeholder="Search documents..." className="max-w-sm" />
        <Button variant="outline">Search</Button>
      </div>

      {/* Document Categories */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Invoices
            </CardTitle>
            <CardDescription>
              Customer invoices and receipts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total Files:</span>
                <span className="font-medium">24</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Last Updated:</span>
                <span className="text-muted-foreground">2 hours ago</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Folder className="h-5 w-5" />
              Contracts
            </CardTitle>
            <CardDescription>
              Vendor and supplier contracts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total Files:</span>
                <span className="font-medium">8</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Last Updated:</span>
                <span className="text-muted-foreground">1 day ago</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Reports
            </CardTitle>
            <CardDescription>
              Business reports and analytics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total Files:</span>
                <span className="font-medium">15</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Last Updated:</span>
                <span className="text-muted-foreground">3 days ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Documents */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Documents</CardTitle>
          <CardDescription>
            Recently uploaded or modified documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="font-medium">Invoice_2024_001.pdf</p>
                  <p className="text-sm text-muted-foreground">Customer invoice</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">2.4 MB</p>
                <p className="text-xs text-muted-foreground">2 hours ago</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <Folder className="h-8 w-8 text-green-500" />
                <div>
                  <p className="font-medium">Vendor_Contract_2024.docx</p>
                  <p className="text-sm text-muted-foreground">Supplier agreement</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">1.8 MB</p>
                <p className="text-xs text-muted-foreground">1 day ago</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <Calendar className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="font-medium">Monthly_Report_Jan_2024.xlsx</p>
                  <p className="text-sm text-muted-foreground">Business report</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">3.2 MB</p>
                <p className="text-xs text-muted-foreground">3 days ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Coming Soon Message */}
      <Card>
        <CardHeader>
          <CardTitle>Document Management</CardTitle>
          <CardDescription>
            Advanced document features coming soon
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            We're working on advanced document management features including version control, 
            collaborative editing, and automated document processing. Stay tuned for updates!
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 