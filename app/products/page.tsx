"use client";

import { useState, useEffect, useRef } from "react";
import ProductModal from "@/components/ProductModal";
import ConfirmModal from "@/components/ConfirmModal";
import ProductDetailsModal from "@/components/ProductDetailsModal";
import { useProducts } from "@/hooks/useProducts";
import { useDeleteProduct } from "@/hooks/useDeleteProduct";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Eye, Pencil, Trash2, Plus, Search, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

const PAGE_LIMIT = 5;

// Define categories array - shared with ProductModal
export const PRODUCT_CATEGORIES = [
  "electronics",
  "fashion",
  "food",
  "book",
  "furniture",
  "sports",
  "automotive",
] as const;

type Product = {
  id: string | number;
  name: string;
  price: number;
  category: string;
  createdAt?: string;
  [key: string]: unknown;
};

export default function ProductsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [category, setCategory] = useState<"all" | string>("all");
  const [isFilterLoading, setIsFilterLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [detailsProduct, setDetailsProduct] = useState<Product | null>(null);
  const [showNoCategoryModal, setShowNoCategoryModal] = useState(false);
  const noCategoryShownRef = useRef(false);
  const previousCategoryRef = useRef<string>("all");

 
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1); 
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);



  const { data, isLoading, isError, error } = useProducts(
    page,
    search,
    category === "all" ? "" : category,
  );

  useEffect(() => {
    if (previousCategoryRef.current !== category) {
      setIsFilterLoading(true);
      previousCategoryRef.current = category;
    }
  }, [category]);

  useEffect(() => {
    if (!isLoading && data) {
      setIsFilterLoading(false);
    }
  }, [isLoading, data]);

 
  const { data: nextPageData } = useProducts(
    page + 1,
    search,
    category === "all" ? "" : category,
  );

  const deleteMutation = useDeleteProduct();

  const products: Product[] = data?.products || [];
  const totalProducts = data?.total || 0;

  const nextPageProducts = nextPageData?.products || [];
  const hasNextPage = nextPageProducts.length > 0;


  useEffect(() => {
    if (category === "all") {
      noCategoryShownRef.current = false;
    }
  }, [category]);

  useEffect(() => {
    if (!isLoading && category !== "all" && products.length === 0 && page === 1) {
      if (!noCategoryShownRef.current) {
        noCategoryShownRef.current = true;
        setShowNoCategoryModal(true);
        setCategory("all"); 
      }
    }
  }, [isLoading, products.length, page, category]);


  if (isLoading && !data) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading products...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    console.error('Main query error:', error);
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg">
            Failed to load products. Please check internet connection and try again.
          </p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const showTableLoader = isLoading || isFilterLoading;

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
       
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Product Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your product inventory and track sales
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
           
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto flex-1">
            
              <div className="relative flex-1 sm:max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-9"
                  disabled={showTableLoader}
                />
              </div>

             
              <div className="w-full sm:w-48 relative">
                <Select
                  value={category}
                  onValueChange={(value) => {
                    setPage(1);
                    setCategory(value);
                  }}
                  disabled={showTableLoader}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {PRODUCT_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c.charAt(0).toUpperCase() + c.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {showTableLoader && (
                  <Loader2 className="absolute right-10 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
                )}
              </div>
            </div>

            
            <Button
              variant="outline"
              onClick={() => setShowModal(true)}
              className="w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-500 rounded-lg shadow-sm border p-5">
            <div className="text-sm font-medium text-gray-900">
              Total Products
            </div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {totalProducts}
            </div>
          </div>
          <div className="bg-purple-500 rounded-lg shadow-sm border p-5">
            <div className="text-sm font-medium text-gray-900">Categories</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {category === "all" ? PRODUCT_CATEGORIES.length : 1}
            </div>
          </div>
          <div className="bg-yellow-500 rounded-lg shadow-sm border p-5">
            <div className="text-sm font-medium text-gray-900">Page</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{page}</div>
          </div>
        </div>

      
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead className="font-semibold">S/N</TableHead>
                  <TableHead className="font-semibold">Product Name</TableHead>
                  <TableHead className="font-semibold">Price</TableHead>
                  <TableHead className="font-semibold">Category</TableHead>
                  <TableHead className="text-right font-semibold">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {showTableLoader ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-12 text-gray-500"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Loading...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : products.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-12 text-gray-500"
                    >
                      No products found. Try adjusting your search or filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product, index) => (
                    <TableRow 
                      key={product.id}
                      className="hover:bg-blue-50/50 transition-colors duration-150"
                    >
                      <TableCell className="text-gray-800">
                        {(page - 1) * PAGE_LIMIT + index + 1}
                      </TableCell>
                      <TableCell className="font-medium">
                        {product.name}
                      </TableCell>
                      <TableCell className="text-gray-800">
                        ₦{product.price.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {product.category.charAt(0).toUpperCase() +
                            product.category.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDetailsProduct(product)}
                            className="h-8 w-8 p-0"
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingProduct(product)}
                            className="h-8 w-8 p-0"
                            title="Edit product"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDeletingProduct(product)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Delete product"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

         
          <div className="border-t bg-gray-50/50 px-4 py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-600">
                Showing{" "}
                <span className="font-medium">
                  {products.length > 0 ? (page - 1) * PAGE_LIMIT + 1 : 0}
                </span>
                {" - "}
                <span className="font-medium">
                  {(page - 1) * PAGE_LIMIT + products.length}
                </span>
                {" of "}
                <span className="font-medium">{totalProducts}</span> products
              </p>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1 || showTableLoader}
                >
                  Previous
                </Button>

                <span className="text-sm text-gray-700 px-3">Page {page}</span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!hasNextPage || showTableLoader}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

     
      {showModal && (
        <ProductModal mode="create" onClose={() => setShowModal(false)} />
      )}

      {editingProduct && (
        <ProductModal
          mode="edit"
          product={{ ...editingProduct, id: String(editingProduct.id) }}
          onClose={() => setEditingProduct(null)}
        />
      )}

      {deletingProduct && (
        <ConfirmModal
          message={`Are you sure you want to delete "${deletingProduct.name}"?`}
          onConfirm={() =>
            deleteMutation.mutate(String(deletingProduct.id), {
              onSuccess: () => {
                setDeletingProduct(null);
                toast.success("Product deleted successfully!");
                
                if (products.length === 1 && page > 1) {
                  setPage(page - 1);
                }
              },
            })
          }
          onCancel={() => setDeletingProduct(null)}
        />
      )}

      {detailsProduct && (
        <ProductDetailsModal
          product={detailsProduct}
          onClose={() => setDetailsProduct(null)}
        />
      )}

 
      {showNoCategoryModal && (
        <Dialog open={showNoCategoryModal} onOpenChange={setShowNoCategoryModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>No Products Found</DialogTitle>
            </DialogHeader>

            <div className="py-4">
              <p className="text-gray-600">
                No products yet in this category.
              </p>
            </div>

            <DialogFooter>
              <Button onClick={() => setShowNoCategoryModal(false)}>
                OK
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}