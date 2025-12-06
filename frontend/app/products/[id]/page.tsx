"use client"

import { useQuery } from "@tanstack/react-query"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft } from "lucide-react"

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

async function fetchProduct(id: string): Promise<Product> {
  const response = await fetch(`${API_URL}/api/products/${id}`)
  if (!response.ok) {
    throw new Error("Failed to fetch product")
  }
  return response.json()
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => fetchProduct(productId),
  })

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <Skeleton className="h-10 w-32 mb-6" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </div>
    )
  }

  if (isError || !product) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-destructive mb-2">
            Product Not Found
          </h2>
          <p className="text-muted-foreground">
            The product you're looking for doesn't exist.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Products
      </Button>

      <div className="bg-card border rounded-lg p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <p className="text-muted-foreground">ID: {product.id}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Category
            </label>
            <p className="text-lg font-semibold">{product.category}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Price
            </label>
            <p className="text-lg font-semibold">
              ${product.price.toFixed(2)}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Stock
            </label>
            <p className="text-lg font-semibold">{product.stock} units</p>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Rating
            </label>
            <p className="text-lg font-semibold">
              ⭐ {product.rating.toFixed(1)} / 5.0
            </p>
          </div>
        </div>

        <div className="pt-4 border-t">
          <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <label className="font-medium">Created At</label>
              <p>{new Date(product.created_at).toLocaleString()}</p>
            </div>
            <div>
              <label className="font-medium">Updated At</label>
              <p>{new Date(product.updated_at).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


