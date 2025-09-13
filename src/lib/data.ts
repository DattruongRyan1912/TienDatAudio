import speakersData from '../../data/products/speakers.json';
import amplifiersData from '../../data/products/amplifiers.json';
import categoriesData from '../../data/categories.json';
import brandsData from '../../data/brands.json';

export interface ProductSEO {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
  schemaMarkup?: Record<string, unknown>;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  brand: string;
  price: number;
  salePrice?: number | null;
  images: string[];
  specifications: Record<string, string | string[]>;
  description: string;
  features: string[];
  inStock: boolean;
  featured: boolean;
  bestseller: boolean;
  createdAt: string;
  updatedAt: string;
  seo?: ProductSEO;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  sortOrder: number;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string;
  description: string;
  country?: string;
  productCount?: number;
}

export interface ProductFilters {
  category?: string;
  brand?: string;
  priceRange?: [number, number];
  search?: string;
  featured?: boolean;
  bestseller?: boolean;
  limit?: number;
}

export async function getProducts(filters: ProductFilters = {}): Promise<Product[]> {
  const allProducts = await getAllProducts();

  let filteredProducts = allProducts;

  // Apply filters
  if (filters.category) {
    filteredProducts = filteredProducts.filter(
      product => product.category === filters.category
    );
  }

  if (filters.brand) {
    filteredProducts = filteredProducts.filter(
      product => product.brand === filters.brand
    );
  }

  if (filters.priceRange) {
    const [min, max] = filters.priceRange;
    filteredProducts = filteredProducts.filter(
      product => {
        const price = product.salePrice || product.price;
        return price >= min && price <= max;
      }
    );
  }

  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    filteredProducts = filteredProducts.filter(
      product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.features.some(feature => 
          feature.toLowerCase().includes(searchTerm)
        )
    );
  }

  if (filters.featured !== undefined) {
    filteredProducts = filteredProducts.filter(
      product => product.featured === filters.featured
    );
  }

  if (filters.bestseller !== undefined) {
    filteredProducts = filteredProducts.filter(
      product => product.bestseller === filters.bestseller
    );
  }

  return filteredProducts;
}

// Get all products without filters
export async function getAllProducts(): Promise<Product[]> {
  const allProducts = [
    ...speakersData.speakers,
    ...amplifiersData.amplifiers,
    // Add more product types here as needed
  ] as Product[];
  return allProducts;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const allProducts = await getProducts();
  return allProducts.find(product => product.slug === slug) || null;
}

export async function getProductById(id: string): Promise<Product | null> {
  const allProducts = await getProducts();
  return allProducts.find(product => product.id === id) || null;
}

export async function getFeaturedProducts(): Promise<Product[]> {
  return getProducts({ featured: true });
}

export async function getBestsellerProducts(): Promise<Product[]> {
  return getProducts({ bestseller: true });
}

export async function getRelatedProducts(productId: string, limit: number = 4): Promise<Product[]> {
  const product = await getProductById(productId);
  if (!product) return [];

  const relatedProducts = await getProducts({ 
    category: product.category 
  });

  return relatedProducts
    .filter(p => p.id !== productId)
    .slice(0, limit);
}

export async function getCategories(): Promise<Category[]> {
  return categoriesData.categories.sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const categories = await getCategories();
  return categories.find(category => category.slug === slug) || null;
}

export async function getBrands(): Promise<Brand[]> {
  return brandsData.brands;
}

export async function getBrandBySlug(slug: string): Promise<Brand | null> {
  const brands = await getBrands();
  return brands.find(brand => brand.slug === slug) || null;
}

export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  return getProducts({ category: categorySlug });
}

export async function getProductsByBrand(brandSlug: string): Promise<Product[]> {
  return getProducts({ brand: brandSlug });
}

// Search functionality
export async function searchProducts(query: string): Promise<Product[]> {
  return getProducts({ search: query });
}
