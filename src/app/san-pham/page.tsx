import { Suspense } from "react"
import Link from "next/link"
import { getProducts, getCategories, getBrands } from "@/lib/data"
import ProductGrid from "@/components/ProductGrid"
import ProductFilter from "@/components/ProductFilter"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sản phẩm - Tiến Đạt Audio",
  description: "Danh sách đầy đủ các sản phẩm thiết bị âm thanh chất lượng cao từ Tiến Đạt Audio",
}

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string;
    brand?: string;
    search?: string;
    priceMin?: string;
    priceMax?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const filters = {
    category: params.category,
    brand: params.brand,
    search: params.search,
    priceRange: params.priceMin && params.priceMax 
      ? [parseInt(params.priceMin), parseInt(params.priceMax)] as [number, number]
      : undefined,
  }

  const [products, categories, brands] = await Promise.all([
    getProducts(filters),
    getCategories(),
    getBrands(),
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link href="/" className="text-gray-700 hover:text-primary">
                Trang chủ
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-gray-500">Sản phẩm</span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Sản Phẩm Thiết Bị Âm Thanh
          </h1>
          <p className="text-lg text-gray-600">
            Khám phá bộ sưu tập thiết bị âm thanh chất lượng cao từ các thương hiệu hàng đầu
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filter Sidebar */}
          <aside className="lg:col-span-1">
            <Suspense fallback={<div>Loading filters...</div>}>
              <ProductFilter 
                categories={categories}
                brands={brands}
                currentFilters={filters}
              />
            </Suspense>
          </aside>

          {/* Products Grid */}
          <main className="lg:col-span-3">
            <Suspense fallback={<div>Loading products...</div>}>
              <ProductGrid products={products} />
            </Suspense>
          </main>
        </div>
      </div>
    </div>
  )
}
