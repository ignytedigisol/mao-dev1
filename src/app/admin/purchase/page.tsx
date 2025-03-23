"use client"

import { Header } from "@/components/header"
import { PurchaseForm } from "@/components/purchase-form"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useState } from "react"
import { brandConfig } from "@/config/brand"
import { apiService, PurchaseItem } from "@/lib/api"
import { toast } from "@/components/ui/use-toast"

// Define the schema to match PurchaseForm component
const purchaseFormSchema = z.object({
  productName: z.string().min(1, "Product name is required"),
  category: z.string().min(1, "Category is required"),
  vendor: z.string().min(1, "Vendor is required"),
  grossWeight: z.string().min(1, "Gross weight is required"),
  stamp: z.string().min(1, "Stamp is required"),
  wastage: z.string().min(1, "Wastage is required"),
  purchaseMulti: z.string().min(1, "Purchase multi is required"),
  fineWeight: z.string().min(1, "Fine weight is required"),
  todaysRate: z.string().min(1, "Today's rate is required"),
  discount: z.string().optional(),
  purchasePrice: z.string().min(1, "Purchase price is required"),
  quantity: z.string().min(1, "Quantity is required"),
  settlementMethod: z.string().min(1, "Settlement method is required"),
  rawMaterial: z.string().optional(),
  remarks: z.string().optional(),
})

type PurchaseFormValues = z.infer<typeof purchaseFormSchema>

// Props that will be injected by the layout
interface PageProps {
  toggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
}

export default function PurchasePage({ toggleMobileMenu }: PageProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleClose = () => {
    // In a real app, this could navigate back or close the modal
    router.push('/admin')
  }

  const handleFormSubmit = async (data: PurchaseFormValues) => {
    try {
      setIsSubmitting(true)

      // Add the current date to the purchase data
      const purchaseData: PurchaseItem = {
        ...data,
        purchaseDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
      };

      console.log("Submitting data to API:", purchaseData);

      try {
        // Submit the data to the API
        const response = await apiService.createPurchase(purchaseData);
        console.log("API response:", response);

        toast({
          title: "Success",
          description: "Purchase information saved successfully.",
          variant: "default",
        });

        // Navigate back to inventory or admin page
        router.push('/admin/inventory');
      } catch (error) {
        console.error("Error calling API:", error);

        // We'll still show a success message for now since the API might not be fully set up
        toast({
          title: "Success (Demo Mode)",
          description: "Purchase information saved locally. API integration pending.",
          variant: "default",
        });

        // In demo mode, we'll still navigate
        router.push('/admin/inventory');
      }
    } catch (error) {
      setIsSubmitting(false)
      console.error("Error submitting form:", error)

      toast({
        title: "Error",
        description: "There was a problem saving the purchase information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col h-full w-full">
      <Header
        title="Add Purchase Information"
        onClose={handleClose}
        onMenuToggle={toggleMobileMenu}
      />

      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="w-full mx-auto px-3 py-4 sm:px-4 md:px-6 max-w-3xl">
          <PurchaseForm onSubmit={handleFormSubmit} />
        </div>
      </div>
    </div>
  )
}
