"use client"

import { useVirtualizer } from "@tanstack/react-virtual"
import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { useState, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronLeft, ChevronRight, Search } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

type Product = {
  id: number
  name: string
  category: string
  price: number
  stock: number
  rating: number
  created_at: string
  updated_at: string
}

type ProductListResponse = {
  items: Product[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

type SortField = "name" | "price" | "rating" | "stock" | "created_at"
type SortOrder = "asc" | "desc"

async function fetchProducts(params: {
  page: number
  page_size: number
  search?: string
  category?: string
  min_price?: number
  max_price?: number
  min_rating?: number
  sort_by?: SortField
  sort_order?: SortOrder
}): Promise<ProductListResponse> {
  const queryParams = new URLSearchParams({
    page: params.page.toString(),
    page_size: params.page_size.toString(),
  })

  if (params.search) queryParams.append("search", params.search)
  if (params.category) queryParams.append("category", params.category)
  if (params.min_price !== undefined)
    queryParams.append("min_price", params.min_price.toString())
  if (params.max_price !== undefined)
    queryParams.append("max_price", params.max_price.toString())
  if (params.min_rating !== undefined)
    queryParams.append("min_rating", params.min_rating.toString())
  if (params.sort_by) queryParams.append("sort_by", params.sort_by)
  if (params.sort_order) queryParams.append("sort_order", params.sort_order)

  const response = await fetch(`${API_URL}/api/products?${queryParams}`)
  if (!response.ok) {
    throw new Error("Failed to fetch products")
  }
  return response.json()
}

export function DataTable() {
  const router = useRouter()
  const parentRef = useRef<HTMLDivElement>(null)

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState<string>("")
  const [minPrice, setMinPrice] = useState<string>("")
  const [maxPrice, setMaxPrice] = useState<string>("")
  const [minRating, setMinRating] = useState<string>("")
  const [sortBy, setSortBy] = useState<SortField>("created_at")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")

  const queryParams = useMemo(
    () => ({
      page,
      page_size: pageSize,
      search: search || undefined,
      category: category || undefined,
      min_price: minPrice ? parseFloat(minPrice) : undefined,
      max_price: maxPrice ? parseFloat(maxPrice) : undefined,
      min_rating: minRating ? parseFloat(minRating) : undefined,
      sort_by: sortBy,
      sort_order: sortOrder,
    }),
    [page, pageSize, search, category, minPrice, maxPrice, minRating, sortBy, sortOrder]
  )

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["products", queryParams],
    queryFn: () => fetchProducts(queryParams),
    placeholderData: keepPreviousData,
  })

  const products = data?.items || []

  const virtualizer = useVirtualizer({
    count: products.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
    overscan: 10,
  })

  const handleRowClick = (productId: number) => {
    router.push(`/products/${productId}`)
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1) // Reset to first page on search
  }

  const handleFilterChange = () => {
    setPage(1) // Reset to first page on filter change
  }

  if (isError) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive">Error</h2>
          <p className="mt-2 text-muted-foreground">
            {error instanceof Error ? error.message : "Failed to load products"}
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="mt-4"
          >
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-4">
      <h1 className="text-3xl font-bold">Products</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="w-[180px]">
          <Input
            type="text"
            placeholder="Category"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value)
              handleFilterChange()
            }}
          />
        </div>

        <div className="w-[140px]">
          <Input
            type="number"
            placeholder="Min Price"
            value={minPrice}
            onChange={(e) => {
              setMinPrice(e.target.value)
              handleFilterChange()
            }}
          />
        </div>

        <div className="w-[140px]">
          <Input
            type="number"
            placeholder="Max Price"
            value={maxPrice}
            onChange={(e) => {
              setMaxPrice(e.target.value)
              handleFilterChange()
            }}
          />
        </div>

        <div className="w-[140px]">
          <Input
            type="number"
            placeholder="Min Rating"
            value={minRating}
            onChange={(e) => {
              setMinRating(e.target.value)
              handleFilterChange()
            }}
            min="0"
            max="5"
            step="0.1"
          />
        </div>

        <div className="w-[150px]">
          <Select
            value={sortBy}
            onValueChange={(value) => {
              setSortBy(value as SortField)
              handleFilterChange()
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="price">Price</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
              <SelectItem value="stock">Stock</SelectItem>
              <SelectItem value="created_at">Created At</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-[120px]">
          <Select
            value={sortOrder}
            onValueChange={(value) => {
              setSortOrder(value as SortOrder)
              handleFilterChange()
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Ascending</SelectItem>
              <SelectItem value="desc">Descending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        {isLoading && !data ? (
          <div className="p-4 space-y-2">
            {[...Array(10)].map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No products found
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="grid grid-cols-6 gap-4 px-4 py-3 bg-muted/50 border-b font-semibold text-sm">
              <div>Name</div>
              <div>Category</div>
              <div>Price</div>
              <div>Stock</div>
              <div>Rating</div>
              <div>Created</div>
            </div>

            <div
              ref={parentRef}
              className="h-[600px] overflow-auto"
              style={{ contain: "strict" }}
            >
              <div
                style={{
                  height: `${virtualizer.getTotalSize()}px`,
                  width: "100%",
                  position: "relative",
                }}
              >
                {virtualizer.getVirtualItems().map((virtualRow) => {
                  const product = products[virtualRow.index]
                  return (
                    <div
                      key={virtualRow.key}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: `${virtualRow.size}px`,
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                    >
                      <div
                        className="grid grid-cols-6 gap-4 px-4 py-3 border-b hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => handleRowClick(product.id)}
                      >
                        <div className="font-medium truncate">{product.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {product.category}
                        </div>
                        <div className="font-semibold">
                          ${product.price.toFixed(2)}
                        </div>
                        <div className="text-sm">{product.stock}</div>
                        <div className="text-sm">
                          ⭐ {product.rating.toFixed(1)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(product.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Pagination */}
            {data && (
              <div className="flex items-center justify-between p-4 border-t bg-muted/50">
                <div className="text-sm text-muted-foreground">
                  Showing {((page - 1) * pageSize) + 1} to{" "}
                  {Math.min(page * pageSize, data.total)} of {data.total}{" "}
                  products
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1 || isLoading}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <div className="text-sm">
                    Page {page} of {data.total_pages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPage((p) => Math.min(data.total_pages, p + 1))
                    }
                    disabled={page === data.total_pages || isLoading}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

