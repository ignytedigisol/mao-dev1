"use client"

import { useState, useMemo, useRef } from "react"
import { Header } from "@/components/header"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Search,
  Pencil,
  Trash,
  ChevronDown,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Check,
  FileText,
  Download,
  Plus,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
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
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

// Sample inventory data matching the screenshot
const inventoryItemsData = [
  {
    id: 1,
    product: "trialadd",
    category: "Earrings",
    vendor: "vendor2",
    grossWt: "2 g",
    fineWt: "2.14 g",
    price: "₹5,08,220.72",
    qty: 1,
    settlement: "Cash"
  },
  {
    id: 2,
    product: "Botus LLoom",
    category: "Earrings",
    vendor: "ABC Jewels Inc.",
    grossWt: "2 g",
    fineWt: "2.16 g",
    price: "₹12,636",
    qty: 1,
    settlement: "Cash"
  },
  {
    id: 3,
    product: "Pagi check",
    category: "Earrings",
    vendor: "vendor2",
    grossWt: "5 g",
    fineWt: "5.45 g",
    price: "₹24,525",
    qty: 1,
    settlement: "Cash"
  },
  {
    id: 4,
    product: "Phone",
    category: "Bracelets",
    vendor: "ABC Jewels Inc.",
    grossWt: "2 g",
    fineWt: "2.14 g",
    price: "₹9,630",
    qty: 1,
    settlement: "Cash"
  },
  {
    id: 5,
    product: "trial1",
    category: "Earrings",
    vendor: "vendor2",
    grossWt: "4 g",
    fineWt: "4.24 g",
    price: "₹20,140",
    qty: 1,
    settlement: "Cash"
  }
]

// All available options for filters
const categories = ["All Categories", "Earrings", "Necklace", "Bracelets", "Rings"];
const vendors = ["All Vendors", "ABC Jewels Inc.", "vendor2"];
const paymentMethods = ["All Payment Methods", "Cash", "Bank Transfer", "Credit Card"];

// Define interface for inventory item
interface InventoryItem {
  id: number;
  product: string;
  category: string;
  vendor: string;
  grossWt: string;
  fineWt: string;
  price: string;
  qty: number;
  settlement: string;
}

// Define sort options type
type SortField = keyof InventoryItem | null;
type SortDirection = 'asc' | 'desc';

// Props that will be injected by the layout
interface PageProps {
  toggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
}

export default function InventoryPage({ toggleMobileMenu }: PageProps) {
  const router = useRouter()

  // State for filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedVendor, setSelectedVendor] = useState("All Vendors");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("All Payment Methods");
  const [minPrice, setMinPrice] = useState("0");
  const [maxPrice, setMaxPrice] = useState("15000");

  // State for inventory data
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(inventoryItemsData);

  // State for editing
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [editedValues, setEditedValues] = useState<Partial<InventoryItem>>({});
  const [showEditDialog, setShowEditDialog] = useState(false);

  // State for delete confirmation
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // State for sorting
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Add pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Add export dialog state
  const [showExportDialog, setShowExportDialog] = useState(false);

  // Add bulk selection state
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);

  // Individual reset functions for each filter
  const resetSearch = () => setSearchTerm("");
  const resetCategory = () => setSelectedCategory("All Categories");
  const resetVendor = () => setSelectedVendor("All Vendors");
  const resetPaymentMethod = () => setSelectedPaymentMethod("All Payment Methods");
  const resetPriceRange = () => {
    setMinPrice("0");
    setMaxPrice("15000");
  };

  // Handle search change with real-time filtering
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Handle min price change
  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMinPrice(e.target.value);
  };

  // Handle max price change
  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMaxPrice(e.target.value);
  };

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Get sort icon for column
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="ml-1 h-3 w-3 inline opacity-50" />;
    return sortDirection === 'asc'
      ? <ArrowUp className="ml-1 h-3 w-3 inline text-blue-500" />
      : <ArrowDown className="ml-1 h-3 w-3 inline text-blue-500" />;
  };

  // Start editing an item
  const startEditing = (item: InventoryItem) => {
    setEditingItemId(item.id);
    setEditedValues({ ...item });
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingItemId(null);
    setEditedValues({});
  };

  // Open edit confirmation dialog
  const openEditDialog = () => {
    setShowEditDialog(true);
  };

  // Close edit confirmation dialog
  const closeEditDialog = () => {
    setShowEditDialog(false);
  };

  // Save edited item after confirmation
  const confirmEdit = () => {
    if (editingItemId === null) return;

    const updatedItems = inventoryItems.map(item =>
      item.id === editingItemId ? { ...item, ...editedValues } : item
    );

    setInventoryItems(updatedItems);
    setEditingItemId(null);
    setEditedValues({});
    closeEditDialog();
  };

  // Handle change in edited fields
  const handleEditChange = (field: keyof InventoryItem, value: string | number) => {
    setEditedValues(prev => ({ ...prev, [field]: value }));
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (id: number) => {
    setDeleteItemId(id);
    setShowDeleteDialog(true);
  };

  // Close delete confirmation dialog
  const closeDeleteDialog = () => {
    setDeleteItemId(null);
    setShowDeleteDialog(false);
  };

  // Delete item
  const confirmDelete = () => {
    if (deleteItemId === null) return;

    const updatedItems = inventoryItems.filter(item => item.id !== deleteItemId);
    setInventoryItems(updatedItems);
    closeDeleteDialog();
  };

  // Handle bulk selection
  const handleSelectItem = (id: number) => {
    setSelectedItems(prev => {
      if (prev.includes(id)) {
        return prev.filter(itemId => itemId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedItems.length === currentItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(currentItems.map(item => item.id));
    }
  };

  const handleBulkDelete = () => {
    setShowBulkDeleteDialog(true);
  };

  const confirmBulkDelete = () => {
    const updatedItems = inventoryItems.filter(item => !selectedItems.includes(item.id));
    setInventoryItems(updatedItems);
    setSelectedItems([]);
    setShowBulkDeleteDialog(false);
  };

  const closeBulkDeleteDialog = () => {
    setShowBulkDeleteDialog(false);
  };

  const handleBulkExport = () => {
    // In a real app, this would export only the selected items
    console.log(`Exporting ${selectedItems.length} selected items`);
    setShowExportDialog(true);
  };

  // Handle pagination
  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Handle Export
  const handleExport = (type: 'pdf' | 'excel') => {
    // In a real application, this would trigger an API call to generate the export
    console.log(`Exporting inventory as ${type}`);
    // Close the dialog
    setShowExportDialog(false);
  };

  // Add new item (in a real app, this would open a form)
  const handleAddNewItem = () => {
    // For demo purposes, we'll just add a sample item
    const newItem: InventoryItem = {
      id: inventoryItems.length + 1,
      product: "New Product",
      category: "Earrings",
      vendor: "ABC Jewels Inc.",
      grossWt: "3 g",
      fineWt: "3.15 g",
      price: "₹15,000",
      qty: 1,
      settlement: "Cash"
    };

    setInventoryItems([...inventoryItems, newItem]);
  };

  // Sort and filter inventory items
  const filteredItems = useMemo(() => {
    let items = [...inventoryItems];

    // Apply filters
    items = items.filter(item => {
      if (searchTerm && !item.product.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      if (selectedCategory !== "All Categories" && item.category !== selectedCategory) {
        return false;
      }

      if (selectedVendor !== "All Vendors" && item.vendor !== selectedVendor) {
        return false;
      }

      if (selectedPaymentMethod !== "All Payment Methods" && item.settlement !== selectedPaymentMethod) {
        return false;
      }

      const numericPrice = parseFloat(item.price.replace(/[^\d.-]/g, ''));
      const numericMinPrice = parseFloat(minPrice || "0");
      const numericMaxPrice = parseFloat(maxPrice || "15000");
      if (numericPrice < numericMinPrice || numericPrice > numericMaxPrice) {
        return false;
      }

      return true;
    });

    // Apply sorting if a sort field is selected
    if (sortField) {
      items.sort((a, b) => {
        let aValue = a[sortField];
        let bValue = b[sortField];

        // Handle numeric values in string format
        if (sortField === 'price') {
          aValue = parseFloat(a.price.replace(/[^\d.-]/g, ''));
          bValue = parseFloat(b.price.replace(/[^\d.-]/g, ''));
        } else if (sortField === 'grossWt' || sortField === 'fineWt') {
          aValue = parseFloat(a[sortField].replace(/[^\d.-]/g, ''));
          bValue = parseFloat(b[sortField].replace(/[^\d.-]/g, ''));
        }

        // Handle string comparison
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortDirection === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        // Handle number comparison
        if (sortDirection === 'asc') {
          return (aValue as number) - (bValue as number);
        } else {
          return (bValue as number) - (aValue as number);
        }
      });
    }

    return items;
  }, [inventoryItems, searchTerm, selectedCategory, selectedVendor, selectedPaymentMethod, minPrice, maxPrice, sortField, sortDirection]);

  // Calculate pagination
  const totalItems = filteredItems.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

  const resetFilters = () => {
    resetSearch();
    resetCategory();
    resetVendor();
    resetPaymentMethod();
    resetPriceRange();
  };

  return (
    <>
      <Header
        title="Inventory"
        onMenuToggle={toggleMobileMenu}
      />

      <div className="flex-1 overflow-auto p-3 sm:p-5 bg-white">
        {/* Edit Confirmation Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg">Confirm Changes</DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                Are you sure you want to save these changes to the inventory item?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                onClick={closeEditDialog}
                className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-800 border-blue-300 text-xs sm:text-sm h-8 sm:h-9"
              >
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={confirmEdit}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm h-8 sm:h-9"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg">Confirm Deletion</DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                Are you sure you want to delete this inventory item? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                onClick={closeDeleteDialog}
                className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-800 border-blue-300 text-xs sm:text-sm h-8 sm:h-9"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm h-8 sm:h-9"
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Bulk Delete Confirmation Dialog */}
        <Dialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg">Confirm Bulk Deletion</DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                Are you sure you want to delete {selectedItems.length} selected inventory items? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                onClick={closeBulkDeleteDialog}
                className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-800 border-blue-300 text-xs sm:text-sm h-8 sm:h-9"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmBulkDelete}
                className="bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm h-8 sm:h-9"
              >
                Delete {selectedItems.length} Items
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Export Dialog */}
        <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg">Export Inventory</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 py-3 sm:py-4">
              <Button
                variant="outline"
                className="flex items-center justify-center gap-1 sm:gap-2 p-4 sm:p-6 border-dashed border-2 hover:border-blue-600 text-xs sm:text-sm"
                onClick={() => handleExport('pdf')}
              >
                <FileText className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600" />
                <span>Export as PDF</span>
              </Button>
              <Button
                variant="outline"
                className="flex items-center justify-center gap-1 sm:gap-2 p-4 sm:p-6 border-dashed border-2 hover:border-blue-600 text-xs sm:text-sm"
                onClick={() => handleExport('excel')}
              >
                <FileText className="h-4 w-4 sm:h-6 sm:w-6 text-green-600" />
                <span>Export as Excel</span>
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Page Header with Actions - Updated for mobile */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Inventory Management</h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-blue-600 border-blue-600 hover:bg-blue-50 text-xs sm:text-sm h-8 sm:h-9"
              onClick={() => setShowExportDialog(true)}
            >
              <Download className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Export
            </Button>
            <Button
              variant="default"
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm h-8 sm:h-9"
              onClick={handleAddNewItem}
            >
              <Plus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Add New Item
            </Button>
          </div>
        </div>

        {/* Bulk Actions Bar - Mobile optimized */}
        {selectedItems.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-2 sm:p-3 mb-3 sm:mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <div className="text-xs sm:text-sm text-blue-800">
              <span className="font-medium">{selectedItems.length}</span> items selected
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-blue-600 border-blue-200 hover:bg-blue-100 text-xs h-7 sm:h-8"
                onClick={handleBulkExport}
              >
                <Download className="mr-1 h-3 w-3" />
                Export
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-xs h-7 sm:h-8"
                onClick={handleBulkDelete}
              >
                <Trash className="mr-1 h-3 w-3" />
                Delete
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-gray-600 border-gray-300 text-xs h-7 sm:h-8"
                onClick={() => setSelectedItems([])}
              >
                <X className="mr-1 h-3 w-3" />
                Clear
              </Button>
            </div>
          </div>
        )}

        {/* Search and Filters Bar - Mobile responsive */}
        <div className="bg-white p-3 sm:p-6 rounded-md mb-4 sm:mb-5 border border-gray-200 shadow-sm">
          {/* Search - Better mobile alignment */}
          <div className="w-full mb-3 sm:mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <Input
                placeholder="Search products..."
                className="pl-9 w-full border border-gray-300 bg-white text-gray-900 h-9 sm:h-10 text-sm"
                value={searchTerm}
                onChange={handleSearchChange}
              />
              {searchTerm && (
                <button
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={resetSearch}
                >
                  <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Filter row - Mobile responsive grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 w-full">
            {/* Category Dropdown - Mobile optimized */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between text-xs sm:text-sm text-gray-800 border-gray-300 bg-white h-9 sm:h-10">
                  <span className="truncate">{selectedCategory}</span>
                  <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 opacity-70 flex-shrink-0 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white border-gray-300 w-[180px] sm:w-[200px]">
                <DropdownMenuGroup>
                  {categories.map(category => (
                    <DropdownMenuItem
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={selectedCategory === category ? "bg-blue-50 text-blue-600" : "text-gray-800 hover:bg-gray-100"}
                    >
                      {selectedCategory === category && <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />}
                      <span className="text-xs sm:text-sm">{category}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Vendor Dropdown - Mobile optimized */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between text-xs sm:text-sm text-gray-800 border-gray-300 bg-white h-9 sm:h-10">
                  <span className="truncate">{selectedVendor}</span>
                  <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 opacity-70 flex-shrink-0 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white border-gray-300 w-[180px] sm:w-[200px]">
                <DropdownMenuGroup>
                  {vendors.map(vendor => (
                    <DropdownMenuItem
                      key={vendor}
                      onClick={() => setSelectedVendor(vendor)}
                      className={selectedVendor === vendor ? "bg-blue-50 text-blue-600" : "text-gray-800 hover:bg-gray-100"}
                    >
                      {selectedVendor === vendor && <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />}
                      <span className="text-xs sm:text-sm">{vendor}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Payment Method Dropdown - Mobile optimized */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between text-xs sm:text-sm text-gray-800 border-gray-300 bg-white h-9 sm:h-10">
                  <span className="truncate">
                    {selectedPaymentMethod === "All Payment Methods"
                      ? "Payment Method"
                      : selectedPaymentMethod}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 opacity-70 flex-shrink-0 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white border-gray-300 w-[180px] sm:w-[200px]">
                <DropdownMenuGroup>
                  {paymentMethods.map(method => (
                    <DropdownMenuItem
                      key={method}
                      onClick={() => setSelectedPaymentMethod(method)}
                      className={selectedPaymentMethod === method ? "bg-blue-50 text-blue-600" : "text-gray-800 hover:bg-gray-100"}
                    >
                      {selectedPaymentMethod === method && <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />}
                      <span className="text-xs sm:text-sm">{method}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Price Range Input Group - Better mobile support */}
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="relative flex-1">
                <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs">{brandConfig.currency}</span>
                <Input
                  className="pl-5 h-9 sm:h-10 border-gray-300 bg-white text-gray-900 w-full text-xs sm:text-sm"
                  type="number"
                  value={minPrice}
                  onChange={handleMinPriceChange}
                  placeholder="Min"
                />
              </div>
              <span className="text-gray-400 text-xs sm:text-sm">-</span>
              <div className="relative flex-1">
                <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs">{brandConfig.currency}</span>
                <Input
                  className="pl-5 h-9 sm:h-10 border-gray-300 bg-white text-gray-900 w-full text-xs sm:text-sm"
                  type="number"
                  value={maxPrice}
                  onChange={handleMaxPriceChange}
                  placeholder="Max"
                />
              </div>
              {(minPrice !== "0" || maxPrice !== "15000") && (
                <button
                  className="text-gray-400 hover:text-gray-600"
                  onClick={resetPriceRange}
                >
                  <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Reset Filters Button - Mobile optimized */}
          {(selectedCategory !== "All Categories" ||
            selectedVendor !== "All Vendors" ||
            selectedPaymentMethod !== "All Payment Methods" ||
            searchTerm !== "" ||
            minPrice !== "0" ||
            maxPrice !== "15000") && (
            <div className="w-full flex justify-end mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="text-blue-600 border-blue-600 text-xs h-7 sm:h-8"
              >
                Reset Filters
              </Button>
            </div>
          )}

          {/* Active filters display - Mobile optimized */}
          {(selectedCategory !== "All Categories" ||
            selectedVendor !== "All Vendors" ||
            selectedPaymentMethod !== "All Payment Methods" ||
            minPrice !== "0" ||
            maxPrice !== "15000") && (
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-3 pt-3 border-t border-gray-100">
              {selectedCategory !== "All Categories" && (
                <div className="bg-blue-100 text-blue-800 text-[10px] sm:text-xs px-2 sm:px-3 py-1 rounded-full flex items-center">
                  <span className="truncate max-w-[100px] sm:max-w-none">Cat: {selectedCategory}</span>
                  <button
                    className="ml-1 sm:ml-2 text-blue-600 hover:text-blue-800"
                    onClick={resetCategory}
                  >
                    <X className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  </button>
                </div>
              )}
              {selectedVendor !== "All Vendors" && (
                <div className="bg-blue-100 text-blue-800 text-[10px] sm:text-xs px-2 sm:px-3 py-1 rounded-full flex items-center">
                  <span className="truncate max-w-[100px] sm:max-w-none">Vendor: {selectedVendor}</span>
                  <button
                    className="ml-1 sm:ml-2 text-blue-600 hover:text-blue-800"
                    onClick={resetVendor}
                  >
                    <X className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  </button>
                </div>
              )}
              {selectedPaymentMethod !== "All Payment Methods" && (
                <div className="bg-blue-100 text-blue-800 text-[10px] sm:text-xs px-2 sm:px-3 py-1 rounded-full flex items-center">
                  <span className="truncate max-w-[100px] sm:max-w-none">Pay: {selectedPaymentMethod}</span>
                  <button
                    className="ml-1 sm:ml-2 text-blue-600 hover:text-blue-800"
                    onClick={resetPaymentMethod}
                  >
                    <X className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  </button>
                </div>
              )}
              {(minPrice !== "0" || maxPrice !== "15000") && (
                <div className="bg-blue-100 text-blue-800 text-[10px] sm:text-xs px-2 sm:px-3 py-1 rounded-full flex items-center">
                  <span className="truncate max-w-[100px] sm:max-w-none">Price: {brandConfig.currency}{minPrice}-{brandConfig.currency}{maxPrice}</span>
                  <button
                    className="ml-1 sm:ml-2 text-blue-600 hover:text-blue-800"
                    onClick={resetPriceRange}
                  >
                    <X className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Inventory Table - Mobile optimized */}
        <div className="bg-white rounded-md shadow overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="bg-gray-100 text-left border-b border-gray-200">
                  <th className="px-2 sm:px-3 py-2 text-[10px] sm:text-xs font-medium text-gray-500">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-3 w-3 sm:h-4 sm:w-4"
                        checked={selectedItems.length === currentItems.length && currentItems.length > 0}
                        onChange={handleSelectAll}
                      />
                    </div>
                  </th>
                  <th
                    className="px-2 sm:px-3 py-2 text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                    onClick={() => handleSort('product')}
                  >
                    Product {getSortIcon('product')}
                  </th>
                  <th
                    className="px-2 sm:px-3 py-2 text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                    onClick={() => handleSort('category')}
                  >
                    Category {getSortIcon('category')}
                  </th>
                  <th
                    className="px-2 sm:px-3 py-2 text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                    onClick={() => handleSort('vendor')}
                  >
                    Vendor {getSortIcon('vendor')}
                  </th>
                  <th
                    className="px-2 sm:px-3 py-2 text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                    onClick={() => handleSort('grossWt')}
                  >
                    Gross WT {getSortIcon('grossWt')}
                  </th>
                  <th
                    className="px-2 sm:px-3 py-2 text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                    onClick={() => handleSort('fineWt')}
                  >
                    Fine WT {getSortIcon('fineWt')}
                  </th>
                  <th
                    className="px-2 sm:px-3 py-2 text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                    onClick={() => handleSort('price')}
                  >
                    Price {getSortIcon('price')}
                  </th>
                  <th
                    className="px-2 sm:px-3 py-2 text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                    onClick={() => handleSort('qty')}
                  >
                    QTY {getSortIcon('qty')}
                  </th>
                  <th
                    className="px-2 sm:px-3 py-2 text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                    onClick={() => handleSort('settlement')}
                  >
                    Method {getSortIcon('settlement')}
                  </th>
                  <th className="px-2 sm:px-3 py-2 text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentItems.length > 0 ? (
                  currentItems.map((item) => (
                    <tr key={item.id} className={`hover:bg-gray-50 ${selectedItems.includes(item.id) ? 'bg-blue-50' : ''}`}>
                      <td className="px-2 sm:px-3 py-2 sm:py-3 text-xs">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-3 w-3 sm:h-4 sm:w-4"
                            checked={selectedItems.includes(item.id)}
                            onChange={() => handleSelectItem(item.id)}
                          />
                        </div>
                      </td>
                      <td className="px-2 sm:px-3 py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-900">
                        {editingItemId === item.id ? (
                          <Input
                            className="h-7 sm:h-8 py-1 px-2 text-xs bg-white border-gray-300 text-gray-900"
                            value={editedValues.product || ""}
                            onChange={(e) => handleEditChange('product', e.target.value)}
                          />
                        ) : (
                          item.product
                        )}
                      </td>
                      <td className="px-2 sm:px-3 py-2 sm:py-3 text-xs sm:text-sm text-gray-700">
                        {editingItemId === item.id ? (
                          <select
                            className="h-7 sm:h-8 py-1 px-2 text-xs border rounded bg-white border-gray-300 text-gray-900"
                            value={editedValues.category || ""}
                            onChange={(e) => handleEditChange('category', e.target.value)}
                          >
                            {categories.slice(1).map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        ) : (
                          item.category
                        )}
                      </td>
                      <td className="px-2 sm:px-3 py-2 sm:py-3 text-xs sm:text-sm text-gray-700">
                        {editingItemId === item.id ? (
                          <select
                            className="h-7 sm:h-8 py-1 px-2 text-xs border rounded bg-white border-gray-300 text-gray-900"
                            value={editedValues.vendor || ""}
                            onChange={(e) => handleEditChange('vendor', e.target.value)}
                          >
                            {vendors.slice(1).map(v => (
                              <option key={v} value={v}>{v}</option>
                            ))}
                          </select>
                        ) : (
                          item.vendor
                        )}
                      </td>
                      <td className="px-2 sm:px-3 py-2 sm:py-3 text-xs sm:text-sm text-gray-700">
                        {editingItemId === item.id ? (
                          <Input
                            className="h-7 sm:h-8 py-1 px-2 text-xs w-16 sm:w-20 bg-white border-gray-300 text-gray-900"
                            value={editedValues.grossWt || ""}
                            onChange={(e) => handleEditChange('grossWt', e.target.value)}
                          />
                        ) : (
                          item.grossWt
                        )}
                      </td>
                      <td className="px-2 sm:px-3 py-2 sm:py-3 text-xs sm:text-sm text-gray-700">
                        {editingItemId === item.id ? (
                          <Input
                            className="h-7 sm:h-8 py-1 px-2 text-xs w-16 sm:w-20 bg-white border-gray-300 text-gray-900"
                            value={editedValues.fineWt || ""}
                            onChange={(e) => handleEditChange('fineWt', e.target.value)}
                          />
                        ) : (
                          item.fineWt
                        )}
                      </td>
                      <td className="px-2 sm:px-3 py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-900">
                        {editingItemId === item.id ? (
                          <div className="relative w-20 sm:w-28">
                            <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-[10px] sm:text-xs">{brandConfig.currency}</span>
                            <Input
                              className="h-7 sm:h-8 py-1 pl-5 sm:pl-6 pr-2 text-xs bg-white border-gray-300 text-gray-900"
                              value={editedValues.price?.replace(/[^\d.-]/g, '') || ""}
                              onChange={(e) => handleEditChange('price', `₹${e.target.value}`)}
                            />
                          </div>
                        ) : (
                          item.price
                        )}
                      </td>
                      <td className="px-2 sm:px-3 py-2 sm:py-3 text-xs sm:text-sm text-gray-700">
                        {editingItemId === item.id ? (
                          <Input
                            className="h-7 sm:h-8 py-1 px-2 text-xs w-12 sm:w-16 bg-white border-gray-300 text-gray-900"
                            type="number"
                            min="1"
                            value={editedValues.qty || 1}
                            onChange={(e) => handleEditChange('qty', parseInt(e.target.value))}
                          />
                        ) : (
                          item.qty
                        )}
                      </td>
                      <td className="px-2 sm:px-3 py-2 sm:py-3 text-xs sm:text-sm text-gray-700">
                        {editingItemId === item.id ? (
                          <select
                            className="h-7 sm:h-8 py-1 px-2 text-xs border rounded bg-white border-gray-300 text-gray-900"
                            value={editedValues.settlement || ""}
                            onChange={(e) => handleEditChange('settlement', e.target.value)}
                          >
                            {paymentMethods.slice(1).map(method => (
                              <option key={method} value={method}>{method}</option>
                            ))}
                          </select>
                        ) : (
                          item.settlement
                        )}
                      </td>
                      <td className="px-2 sm:px-3 py-2 sm:py-3 text-xs">
                        {editingItemId === item.id ? (
                          <div className="flex gap-1 sm:gap-2">
                            <Button
                              variant="default"
                              size="sm"
                              onClick={openEditDialog}
                              className="h-6 w-6 sm:h-8 sm:w-8 p-0 bg-green-600 hover:bg-green-700 rounded-full flex items-center justify-center"
                              title="Save changes"
                            >
                              <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-white" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={cancelEditing}
                              className="h-6 w-6 sm:h-8 sm:w-8 p-0 bg-slate-600 hover:bg-slate-700 rounded-full flex items-center justify-center"
                              title="Cancel editing"
                            >
                              <X className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-white" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex gap-1 sm:gap-2">
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => startEditing(item)}
                              className="h-6 w-6 sm:h-8 sm:w-8 p-0 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center"
                              title="Edit item"
                            >
                              <Pencil className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-white" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => openDeleteDialog(item.id)}
                              className="h-6 w-6 sm:h-8 sm:w-8 p-0 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center"
                              title="Delete item"
                            >
                              <Trash className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-white" />
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="px-3 py-4 text-center text-xs sm:text-sm text-gray-500">
                      No inventory items found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls - Mobile friendly */}
          {filteredItems.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-t border-gray-200 bg-gray-50 px-3 sm:px-4 py-2 sm:py-3 gap-2">
              <div className="flex items-center text-xs sm:text-sm text-gray-500">
                <span>
                  Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
                  <span className="font-medium">
                    {Math.min(indexOfLastItem, totalItems)}
                  </span>{" "}
                  of <span className="font-medium">{totalItems}</span> items
                </span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPrevPage}
                  disabled={currentPage === 1}
                  className="border-gray-300 h-7 sm:h-8 w-7 sm:w-8 p-0"
                >
                  <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => {
                  // Show at most 3 page buttons on mobile, 5 on desktop
                  let pageNum = i + 1;
                  if (totalPages > 3 && currentPage > 2) {
                    pageNum = currentPage - 2 + i;
                  }
                  if (pageNum > totalPages) return null;

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => goToPage(pageNum)}
                      className={`h-7 sm:h-8 w-7 sm:w-8 p-0 text-xs ${
                        currentPage === pageNum
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "border-gray-300 text-gray-700"
                      }`}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="border-gray-300 h-7 sm:h-8 w-7 sm:w-8 p-0"
                >
                  <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
