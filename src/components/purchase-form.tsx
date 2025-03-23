"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Loader2 } from "lucide-react"

import { brandConfig } from "@/config/brand"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useGoldRate } from "@/hooks/useGoldRate"

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

interface PurchaseFormProps {
  onSubmit: (data: PurchaseFormValues) => void;
}

// Helper function to format the last updated time
const formatLastUpdated = (timestamp: string | Date) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  });
};

// Helper function to handle numeric input
const handleNumericInput = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  // Allow numeric values, decimal points, and empty strings
  if (/^$|^[0-9]*\.?[0-9]*$/.test(value)) {
    return true;
  }
  e.preventDefault();
  return false;
};

export function PurchaseForm({ onSubmit }: PurchaseFormProps) {
  const [isCalculating, setIsCalculating] = useState(false);
  const goldRateData = useGoldRate();

  const form = useForm<PurchaseFormValues>({
    resolver: zodResolver(purchaseFormSchema),
    defaultValues: {
      productName: "",
      category: "",
      vendor: "",
      grossWeight: "",
      stamp: "",
      wastage: "",
      purchaseMulti: "",
      fineWeight: "",
      todaysRate: "",
      discount: "",
      purchasePrice: "",
      quantity: "1",
      settlementMethod: "",
      rawMaterial: "",
      remarks: "",
    },
  });

  // Update todaysRate when goldRateData changes
  useEffect(() => {
    if (goldRateData.rate && !goldRateData.loading) {
      // Update the form field with the latest gold rate
      form.setValue("todaysRate", goldRateData.rate.toString());

      // If fineWeight and purchaseMulti already have values, recalculate purchase price
      const fineWeight = form.getValues("fineWeight");
      const purchaseMulti = form.getValues("purchaseMulti");

      if (fineWeight && purchaseMulti) {
        calculatePurchasePrice();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goldRateData.rate, goldRateData.loading]);

  // Update the calculateFineWeight function to handle edge cases
  const calculateFineWeight = () => {
    const grossWeight = parseFloat(form.getValues("grossWeight") || "0");
    const stamp = parseFloat(form.getValues("stamp") || "0");
    const wastage = parseFloat(form.getValues("wastage") || "0");

    if (grossWeight > 0) {
      const stampPercentage = stamp / 100;
      const wastagePercentage = wastage / 100;

      // Fine weight is gross weight times the sum of stamp percentage and wastage percentage
      const fineWeight = grossWeight * (stampPercentage + wastagePercentage);

      // Only update if we have a valid calculation (not NaN or 0)
      if (!isNaN(fineWeight) && fineWeight > 0) {
        form.setValue("fineWeight", fineWeight.toFixed(3));

        // Also trigger purchase price calculation when fine weight changes
        calculatePurchasePrice();
      }
    }
  };

  // Update the calculatePurchasePrice function to handle edge cases
  const calculatePurchasePrice = () => {
    const fineWeight = parseFloat(form.getValues("fineWeight") || "0");
    const todaysRate = parseFloat(form.getValues("todaysRate") || "0");
    const purchaseMulti = parseFloat(form.getValues("purchaseMulti") || "0");
    const discount = parseFloat(form.getValues("discount") || "0");
    const rawMaterial = parseFloat(form.getValues("rawMaterial") || "0");

    if (fineWeight > 0 && todaysRate > 0 && purchaseMulti > 0) {
      setIsCalculating(true);

      try {
        // Calculate base price
        let purchasePrice = fineWeight * todaysRate * (purchaseMulti / 100);

        // Apply discount if present
        if (discount > 0) {
          purchasePrice = purchasePrice - (purchasePrice * (discount / 100));
        }

        // Add raw material cost if present
        if (rawMaterial > 0) {
          purchasePrice += rawMaterial;
        }

        // Only update if we have a valid calculation (not NaN or 0)
        if (!isNaN(purchasePrice) && purchasePrice > 0) {
          form.setValue("purchasePrice", purchasePrice.toFixed(2));
        }
      } finally {
        setIsCalculating(false);
      }
    }
  };

  const handleSubmit = (data: PurchaseFormValues) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 pb-16 md:pb-0">
        {/* Product Information Section */}
        <div>
          <h3 className="text-base font-medium mb-3">Product Information</h3>
          <div className="space-y-3">
            <FormField
              control={form.control}
              name="productName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-gray-700">Product Name</FormLabel>
                  <FormControl>
                    <Input {...field} className="bg-white" />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-gray-700">Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ring">Ring</SelectItem>
                      <SelectItem value="necklace">Necklace</SelectItem>
                      <SelectItem value="earring">Earring</SelectItem>
                      <SelectItem value="bracelet">Bracelet</SelectItem>
                      <SelectItem value="pendant">Pendant</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="vendor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-gray-700">Vendor</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select vendor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="vendor1">Gold Supply Co.</SelectItem>
                      <SelectItem value="vendor2">Precious Metals Inc.</SelectItem>
                      <SelectItem value="vendor3">Royal Jewels Supplier</SelectItem>
                      <SelectItem value="vendor4">Fine Gold Trading</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Weight Information Section */}
        <div>
          <h3 className="text-base font-medium mb-3">Weight Information</h3>
          <div className="space-y-3">
            <FormField
              control={form.control}
              name="grossWeight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-gray-700">Gross Weight</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-white pr-16"
                        onChange={(e) => {
                          if (handleNumericInput(e)) {
                            field.onChange(e);
                            calculateFineWeight();
                          }
                        }}
                      />
                    </FormControl>
                    <div className="absolute right-0 inset-y-0 flex items-center px-3 border-l border-gray-200 bg-gray-50 text-gray-500 text-sm rounded-r-md">
                      grams
                    </div>
                  </div>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="stamp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-gray-700">Stamp</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-white pr-10"
                        onChange={(e) => {
                          if (handleNumericInput(e)) {
                            field.onChange(e);
                            calculateFineWeight();
                          }
                        }}
                      />
                    </FormControl>
                    <div className="absolute right-0 inset-y-0 flex items-center px-3 border-l border-gray-200 bg-gray-50 text-gray-500 text-sm rounded-r-md">
                      %
                    </div>
                  </div>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="wastage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-gray-700">Wastage</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-white pr-10"
                        onChange={(e) => {
                          if (handleNumericInput(e)) {
                            field.onChange(e);
                            calculateFineWeight();
                          }
                        }}
                      />
                    </FormControl>
                    <div className="absolute right-0 inset-y-0 flex items-center px-3 border-l border-gray-200 bg-gray-50 text-gray-500 text-sm rounded-r-md">
                      %
                    </div>
                  </div>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Pricing Information Section */}
        <div>
          <h3 className="text-base font-medium mb-3">Pricing Information</h3>
          <div className="space-y-3">
            <FormField
              control={form.control}
              name="purchaseMulti"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-gray-700">Purchase Multiplier</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-white pr-10"
                        onChange={(e) => {
                          if (handleNumericInput(e)) {
                            field.onChange(e);
                            calculatePurchasePrice();
                          }
                        }}
                      />
                    </FormControl>
                    <div className="absolute right-0 inset-y-0 flex items-center px-3 border-l border-gray-200 bg-gray-50 text-gray-500 text-sm rounded-r-md">
                      %
                    </div>
                  </div>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fineWeight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-gray-700">Fine Weight</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input {...field} readOnly className="bg-white pr-16" />
                    </FormControl>
                    <div className="absolute right-0 inset-y-0 flex items-center px-3 border-l border-gray-200 bg-gray-50 text-gray-500 text-sm rounded-r-md">
                      grams
                    </div>
                  </div>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="todaysRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-gray-700">
                    22K Gold Rate
                    {goldRateData.lastUpdated && !goldRateData.loading && (
                      <span className="text-xs text-gray-500 ml-1">
                        {`(Updated at ${formatLastUpdated(goldRateData.lastUpdated)})`}
                      </span>
                    )}
                    {goldRateData.loading && (
                      <Loader2 className="ml-1 inline h-3.5 w-3.5 animate-spin text-blue-500" />
                    )}
                  </FormLabel>
                  <div className="relative">
                    <div className="absolute left-0 inset-y-0 flex items-center px-3 border-r border-gray-200 bg-gray-50 text-gray-500 text-sm rounded-l-md">
                      {brandConfig.currency}
                    </div>
                    <FormControl>
                      <Input
                        {...field}
                        className="pl-10 bg-white"
                        disabled={true}
                        value={field.value || (goldRateData.rate ? goldRateData.rate.toString() : "")}
                      />
                    </FormControl>
                  </div>
                  {goldRateData.error && (
                    <p className="text-xs text-amber-500 mt-1">
                      {goldRateData.error}
                    </p>
                  )}
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="discount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-gray-700">Discount (Optional)</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-white pr-10"
                        onChange={(e) => {
                          if (handleNumericInput(e)) {
                            field.onChange(e);
                            calculatePurchasePrice();
                          }
                        }}
                      />
                    </FormControl>
                    <div className="absolute right-0 inset-y-0 flex items-center px-3 border-l border-gray-200 bg-gray-50 text-gray-500 text-sm rounded-r-md">
                      %
                    </div>
                  </div>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Additional Information Section */}
        <div>
          <h3 className="text-base font-medium mb-3">Additional Information</h3>
          <div className="space-y-3">
            <FormField
              control={form.control}
              name="purchasePrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-gray-700">
                    Purchase Price
                    {isCalculating && (
                      <Loader2 className="ml-1 inline h-3.5 w-3.5 animate-spin text-blue-500" />
                    )}
                  </FormLabel>
                  <div className="relative">
                    <div className="absolute left-0 inset-y-0 flex items-center px-3 border-r border-gray-200 bg-gray-50 text-gray-500 text-sm rounded-l-md">
                      {brandConfig.currency}
                    </div>
                    <FormControl>
                      <Input {...field} className="pl-10 bg-white" readOnly />
                    </FormControl>
                  </div>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-gray-700">Quantity</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-white pr-10"
                        onChange={(e) => {
                          if (handleNumericInput(e)) field.onChange(e);
                        }}
                      />
                    </FormControl>
                    <div className="absolute right-0 inset-y-0 flex items-center px-3 border-l border-gray-200 bg-gray-50 text-gray-500 text-sm rounded-r-md">
                      pcs
                    </div>
                  </div>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="settlementMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-gray-700">Settlement Method</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="credit">Store Credit</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rawMaterial"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-gray-700">Raw Material Cost (Optional)</FormLabel>
                  <div className="relative">
                    <div className="absolute left-0 inset-y-0 flex items-center px-3 border-r border-gray-200 bg-gray-50 text-gray-500 text-sm rounded-l-md">
                      {brandConfig.currency}
                    </div>
                    <FormControl>
                      <Input
                        {...field}
                        className="pl-10 bg-white"
                        onChange={(e) => {
                          if (handleNumericInput(e)) {
                            field.onChange(e);
                            calculatePurchasePrice();
                          }
                        }}
                      />
                    </FormControl>
                  </div>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-gray-700">Remarks (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} className="bg-white" />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 mt-6">
          <Button
            variant="outline"
            type="button"
            onClick={() => form.reset()}
            className="text-sm h-9"
          >
            Reset
          </Button>
          <Button
            type="submit"
            disabled={form.formState.isSubmitting || isCalculating}
            className="bg-blue-600 hover:bg-blue-700 text-sm h-9"
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Purchase"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
