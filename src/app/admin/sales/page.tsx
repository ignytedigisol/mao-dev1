"use client"

import { useState, useMemo, useRef } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Search, Calendar, BarChart3, Plus, Download, ChevronDown, X, Eye, Trash } from "lucide-react"
import { Input } from "@/components/ui/input"
import { brandConfig } from "@/config/brand"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Sample sales data
const salesTransactions = [
  {
    id: "INV-001",
    date: "2023-12-15",
    customer: "Rajesh Mehta",
    items: [
      { name: "Gold Ring", quantity: 1, price: `${brandConfig.currency}32,500` }
    ],
    total: `${brandConfig.currency}32,500`,
    paymentMethod: "Cash",
    status: "completed"
  },
  {
    id: "INV-002",
    date: "2024-01-05",
    customer: "Anita Sharma",
    items: [
      { name: "Diamond Earrings", quantity: 1, price: `${brandConfig.currency}45,000` },
      { name: "Gold Chain", quantity: 1, price: `${brandConfig.currency}28,000` }
    ],
    total: `${brandConfig.currency}73,000`,
    paymentMethod: "Bank Transfer",
    status: "completed"
  },
  {
    id: "INV-003",
    date: "2024-01-22",
    customer: "Vikram Patel",
    items: [
      { name: "Platinum Bracelet", quantity: 1, price: `${brandConfig.currency}56,000` }
    ],
    total: `${brandConfig.currency}56,000`,
    paymentMethod: "Credit Card",
    status: "completed"
  },
  {
    id: "INV-004",
    date: "2024-02-10",
    customer: "Deepa Gupta",
    items: [
      { name: "Gold Necklace", quantity: 1, price: `${brandConfig.currency}86,500` },
      { name: "Pearl Earrings", quantity: 1, price: `${brandConfig.currency}12,500` }
    ],
    total: `${brandConfig.currency}99,000`,
    paymentMethod: "Bank Transfer",
    status: "pending"
  }
]

// Props that will be injected by the layout
interface PageProps {
  toggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
}

type DateFilterOption = 'last7' | 'last15' | 'last30' | 'lastYear' | 'custom' | 'all';

// Define transaction interface
interface SaleItem {
  name: string;
  quantity: number;
  price: string;
}

interface Transaction {
  id: string;
  date: string;
  customer: string;
  items: SaleItem[];
  total: string;
  paymentMethod: string;
  status: 'completed' | 'pending';
}

// Item options for new sale
const availableItems = [
  { id: 1, name: "Gold Ring", price: 32500 },
  { id: 2, name: "Diamond Earrings", price: 45000 },
  { id: 3, name: "Gold Chain", price: 28000 },
  { id: 4, name: "Pearl Earrings", price: 12500 },
  { id: 5, name: "Platinum Bracelet", price: 56000 },
  { id: 6, name: "Gold Necklace", price: 86500 },
];

// Payment method options
const paymentMethods = ["Cash", "Bank Transfer", "Credit Card"];

export default function SalesPage({ toggleMobileMenu }: PageProps) {
  // Search state
  const [searchTerm, setSearchTerm] = useState("");

  // Date filter state
  const [dateFilter, setDateFilter] = useState<DateFilterOption>('all');
  const [dateRangeText, setDateRangeText] = useState("All Time");

  // Export dialog state
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'xls'>('pdf');

  // Invoice details dialog state
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  // New sale dialog state
  const [newSaleDialogOpen, setNewSaleDialogOpen] = useState(false);
  const [customer, setCustomer] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(paymentMethods[0]);
  const [saleItems, setSaleItems] = useState<{id: number, name: string, quantity: number, price: number}[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [itemQuantity, setItemQuantity] = useState(1);

  // Export functionality
  const tableRef = useRef<HTMLTableElement>(null);

  const handleExport = (format: 'pdf' | 'xls') => {
    setExportFormat(format);
    // In a real app, this would trigger an actual export
    // For demo purposes, we'll just close the dialog after a delay
    setTimeout(() => {
      setExportDialogOpen(false);
    }, 1000);
  };

  // View transaction details
  const viewTransactionDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setDetailsDialogOpen(true);
  };

  // New sale functions
  const openNewSaleDialog = () => {
    setCustomer("");
    setSelectedPaymentMethod(paymentMethods[0]);
    setSaleItems([]);
    setSelectedItemId(null);
    setItemQuantity(1);
    setNewSaleDialogOpen(true);
  };

  const addItemToSale = () => {
    if (selectedItemId && itemQuantity > 0) {
      const item = availableItems.find(item => item.id === selectedItemId);
      if (item) {
        setSaleItems(prev => [
          ...prev,
          {
            id: item.id,
            name: item.name,
            quantity: itemQuantity,
            price: item.price
          }
        ]);
        setSelectedItemId(null);
        setItemQuantity(1);
      }
    }
  };

  const removeItemFromSale = (itemId: number) => {
    setSaleItems(prev => prev.filter(item => item.id !== itemId));
  };

  const calculateTotal = () => {
    return saleItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleCreateSale = () => {
    // In a real app, this would send data to the server
    // For demo purposes, we'll add it to our local state

    // Create a new transaction
    const newTransaction: Transaction = {
      id: `INV-00${salesTransactions.length + 1}`,
      date: new Date().toISOString().split('T')[0],
      customer,
      items: saleItems.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: `${brandConfig.currency}${item.price.toLocaleString()}`
      })),
      total: `${brandConfig.currency}${calculateTotal().toLocaleString()}`,
      paymentMethod: selectedPaymentMethod,
      status: 'completed'
    };

    // Add to transactions array (in a real app, this would be a server call)
    salesTransactions.unshift(newTransaction);

    // Close the dialog
    setNewSaleDialogOpen(false);
  };

  // Date filter options
  const dateFilterOptions = [
    { label: 'All Time', value: 'all' },
    { label: 'Last 7 Days', value: 'last7' },
    { label: 'Last 15 Days', value: 'last15' },
    { label: 'Last 30 Days', value: 'last30' },
    { label: 'Last Year', value: 'lastYear' },
    { label: 'Custom Range', value: 'custom' }
  ];

  // Handle date filter change
  const handleDateFilterChange = (option: DateFilterOption) => {
    setDateFilter(option);

    // Set date range text based on selected option
    switch (option) {
      case 'last7':
        setDateRangeText('Last 7 Days');
        break;
      case 'last15':
        setDateRangeText('Last 15 Days');
        break;
      case 'last30':
        setDateRangeText('Last 30 Days');
        break;
      case 'lastYear':
        setDateRangeText('Last Year');
        break;
      case 'custom':
        setDateRangeText('Custom Range');
        break;
      case 'all':
      default:
        setDateRangeText('All Time');
        break;
    }
  };

  // Date filtering helper function (simplified)
  const isDateInRange = (dateString: string, option: DateFilterOption): boolean => {
    if (option === 'all') return true;

    const date = new Date(dateString);
    const today = new Date();
    const timeDiff = today.getTime() - date.getTime();
    const dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24));

    switch (option) {
      case 'last7':
        return dayDiff <= 7;
      case 'last15':
        return dayDiff <= 15;
      case 'last30':
        return dayDiff <= 30;
      case 'lastYear':
        return dayDiff <= 365;
      // For demo, custom is set to last 90 days
      case 'custom':
        return dayDiff <= 90;
      default:
        return true;
    }
  };

  // Filter transactions based on search and date
  const filteredTransactions = useMemo(() => {
    return salesTransactions.filter(transaction => {
      // Search filter
      const searchMatch = searchTerm === "" ||
        transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));

      // Date filter
      const dateMatch = isDateInRange(transaction.date, dateFilter);

      return searchMatch && dateMatch;
    });
  }, [searchTerm, dateFilter]);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return `${brandConfig.currency}${amount.toLocaleString()}`;
  };

  return (
    <>
      <Header
        title={`${brandConfig.shortName} Sales Dashboard`}
        onMenuToggle={toggleMobileMenu}
      />

      <div className="flex-1 overflow-auto p-6 bg-white">
        {/* Export Dialog */}
        <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Export Sales Data</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-gray-500 mb-4">
                Select a format to export {filteredTransactions.length} records
              </p>
              <div className="flex gap-4">
                <Button
                  onClick={() => handleExport('pdf')}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Export as PDF
                </Button>
                <Button
                  onClick={() => handleExport('xls')}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Export as Excel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Invoice Details Dialog */}
        <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            {selectedTransaction && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex justify-between items-center">
                    <span>Invoice {selectedTransaction.id}</span>
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full
                      ${selectedTransaction.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-amber-100 text-amber-800'}`}>
                      {selectedTransaction.status === 'completed' ? 'Completed' : 'Pending'}
                    </span>
                  </DialogTitle>
                </DialogHeader>

                <div className="py-4">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Customer</p>
                      <p className="text-sm font-semibold">{selectedTransaction.customer}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Date</p>
                      <p className="text-sm font-semibold">{formatDate(selectedTransaction.date)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Payment Method</p>
                      <p className="text-sm font-semibold">{selectedTransaction.paymentMethod}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total</p>
                      <p className="text-sm font-semibold">{selectedTransaction.total}</p>
                    </div>
                  </div>

                  <div className="border-t border-b py-4 my-4">
                    <p className="text-sm font-medium text-gray-500 mb-2">Items</p>
                    {selectedTransaction.items.map((item, index) => (
                      <div key={index} className="flex justify-between py-2">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-xs text-gray-500">Quantity: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-semibold">{item.price}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>{selectedTransaction.total}</span>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setDetailsDialogOpen(false)}
                    className="mr-2"
                  >
                    Close
                  </Button>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Print Invoice
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* New Sale Dialog */}
        <Dialog open={newSaleDialogOpen} onOpenChange={setNewSaleDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Sale</DialogTitle>
              <DialogDescription>
                Enter the customer details and add items to create a new sale.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customer">Customer Name</Label>
                  <Input
                    id="customer"
                    placeholder="Enter customer name"
                    value={customer}
                    onChange={(e) => setCustomer(e.target.value)}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment">Payment Method</Label>
                  <Select
                    value={selectedPaymentMethod}
                    onValueChange={setSelectedPaymentMethod}
                  >
                    <SelectTrigger id="payment" className="w-full">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map(method => (
                        <SelectItem key={method} value={method}>
                          {method}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4 mt-4">
                <h3 className="font-medium text-sm">Items</h3>

                <div className="flex gap-3 items-end">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="item">Select Item</Label>
                    <Select
                      value={selectedItemId?.toString() || ""}
                      onValueChange={(value) => setSelectedItemId(Number(value))}
                    >
                      <SelectTrigger id="item" className="w-full">
                        <SelectValue placeholder="Select an item" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableItems.map(item => (
                          <SelectItem key={item.id} value={item.id.toString()}>
                            {item.name} - {formatCurrency(item.price)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="w-24 space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min={1}
                      value={itemQuantity}
                      onChange={(e) => setItemQuantity(parseInt(e.target.value) || 1)}
                      className="w-full"
                    />
                  </div>

                  <Button
                    className="mb-0.5 bg-blue-600 hover:bg-blue-700"
                    onClick={addItemToSale}
                    disabled={!selectedItemId}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>

                {/* Selected Items List */}
                {saleItems.length > 0 ? (
                  <div className="border rounded-md overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50 text-xs font-medium text-gray-500 uppercase">
                        <tr>
                          <th className="px-4 py-2 text-left">Item</th>
                          <th className="px-4 py-2 text-right">Price</th>
                          <th className="px-4 py-2 text-center">Qty</th>
                          <th className="px-4 py-2 text-right">Total</th>
                          <th className="px-4 py-2 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 text-sm">
                        {saleItems.map(item => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-gray-800">{item.name}</td>
                            <td className="px-4 py-2 text-right text-gray-600">{formatCurrency(item.price)}</td>
                            <td className="px-4 py-2 text-center text-gray-600">{item.quantity}</td>
                            <td className="px-4 py-2 text-right font-medium">{formatCurrency(item.price * item.quantity)}</td>
                            <td className="px-4 py-2 text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 h-6 w-6 p-0"
                                onClick={() => removeItemFromSale(item.id)}
                              >
                                <Trash className="h-3.5 w-3.5" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-gray-50 font-medium">
                          <td colSpan={3} className="px-4 py-2 text-right">Total:</td>
                          <td className="px-4 py-2 text-right">{formatCurrency(calculateTotal())}</td>
                          <td></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-6 border rounded-md border-dashed border-gray-300 text-gray-500">
                    No items added yet. Select an item and add it to the sale.
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setNewSaleDialogOpen(false)}
                className="mr-2"
              >
                Cancel
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleCreateSale}
                disabled={saleItems.length === 0 || !customer}
              >
                Create Sale
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-slate-800 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Sales (Monthly)
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{brandConfig.currency}2,60,500</div>
              <p className="text-xs text-slate-300 mt-1">
                <span className="text-green-400">+12.5%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Transactions
              </CardTitle>
              <Calendar className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-slate-300 mt-1">
                <span className="text-green-400">+8.2%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Average Order Value
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{brandConfig.currency}38,425</div>
              <p className="text-xs text-slate-300 mt-1">
                <span className="text-green-400">+3.1%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Payments
              </CardTitle>
              <Calendar className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{brandConfig.currency}99,000</div>
              <p className="text-xs text-slate-300 mt-1">
                <span className="text-red-400">+21.5%</span> from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col gap-4 mb-6">
          {/* Search and Actions Container */}
          <div className="bg-white rounded-md border border-gray-200 shadow p-5">
            {/* Search */}
            <div className="w-full mb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search sales..."
                  className="pl-10 w-full bg-white border-gray-300"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setSearchTerm("")}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Filter Row - With exact width of search input */}
            <div className="flex w-full justify-between">
              {/* Left side filters */}
              <div className="flex gap-2">
                {/* Date Filter Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="text-gray-800 border-gray-300 bg-white">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{dateRangeText}</span>
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-white border-gray-300">
                    <DropdownMenuGroup>
                      {dateFilterOptions.map(option => (
                        <DropdownMenuItem
                          key={option.value}
                          onClick={() => handleDateFilterChange(option.value as DateFilterOption)}
                          className={dateFilter === option.value ? "bg-blue-50 text-blue-600" : "text-gray-800 hover:bg-gray-200"}
                        >
                          {option.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Export Button */}
                <Button
                  variant="outline"
                  className="text-gray-800 border-gray-300 bg-white"
                  onClick={() => setExportDialogOpen(true)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>

              {/* Right side - New Sale Button */}
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={openNewSaleDialog}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Sale
              </Button>
            </div>
          </div>
        </div>

        {/* Sales Transactions Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full" ref={tableRef}>
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{transaction.id}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                        {transaction.date}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{transaction.customer}</td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {transaction.items.map((item, index) => (
                          <div key={index}>
                            {item.quantity} x {item.name}
                          </div>
                        ))}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{transaction.total}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{transaction.paymentMethod}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <span className={`inline-flex px-2 py-1 text-xs rounded-full
                          ${transaction.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-amber-100 text-amber-800'}`}>
                          {transaction.status === 'completed' ? 'Completed' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                          onClick={() => viewTransactionDetails(transaction)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-4 py-6 text-center text-sm text-gray-500">
                      No sales transactions found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}
