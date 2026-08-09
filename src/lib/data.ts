import speakersData from '../../data/products/speakers.json';
import amplifiersData from '../../data/products/amplifiers.json';
import categoriesData from '../../data/categories.json';
import brandsData from '../../data/brands.json';
import combosData from '../../data/combos.json';

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
    category_id: string; // Foreign key to categories
    brand_id: string;    // Foreign key to brands
    category?: string;   // Keep for backward compatibility, will be populated from category_id
    brand?: string;      // Keep for backward compatibility, will be populated from brand_id
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
    description: string;
    logo: string;
    website?: string;
    country: string;
    sortOrder?: number;
    productCount?: number;
}

interface ComboProduct {
    id: string;
    quantity: number;
    role: 'main' | 'accessory';
}

interface ComboMedia {
    type: 'video' | 'image';
    url?: string;
    posterImage?: string;
    images?: string[];
}

export interface Combo {
    id: string;
    title: string;
    slug: string;
    type: 'video' | 'image';
    thumbnail: string;
    media: ComboMedia;
    description: string;
    products: ComboProduct[];
    // Pricing fields - optional for post type
    originalPrice?: number;
    comboPrice?: number;
    savings?: number;
    savingsPercent?: number;
    // Content type: 'combo' for product combos, 'post' for content posts
    contentType: 'combo' | 'post';
    tags: string[];
    features: string[];
    views: number;
    likes: number;
    shares: number;
    comments: number;
    createdAt: string;
    featured: boolean;
    status: 'active' | 'draft' | 'archived';
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
            product => product.category_id === filters.category
        );
    }

    if (filters.brand) {
        filteredProducts = filteredProducts.filter(
            product => product.brand_id === filters.brand
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

// Helper functions to get data by name/slug
function getCategoryByName(name: string): Category | undefined {
    return categoriesData.categories.find(cat => 
        cat.name.toLowerCase() === name.toLowerCase() || 
        cat.slug.toLowerCase() === name.toLowerCase()
    );
}

function getBrandByName(name: string): Brand | undefined {
    return brandsData.find(brand => 
        brand.name.toLowerCase() === name.toLowerCase() || 
        brand.slug.toLowerCase() === name.toLowerCase()
    );
}

// Get all products without filters
export async function getAllProducts(): Promise<Product[]> {
    const normalizeProduct = (product: Record<string, unknown>): Product => {
        const specifications: Record<string, string | string[]> = {};
        
        // Clean up specifications - ensure all values are strings or string arrays
        if (product.specifications) {
            Object.entries(product.specifications).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    if (Array.isArray(value)) {
                        specifications[key] = value.filter(v => v !== undefined && v !== null);
                    } else {
                        specifications[key] = String(value);
                    }
                }
            });
        }

        // Map category and brand names to IDs, fallback to existing logic
        const categoryName = String(product.category || '');
        const brandName = String(product.brand || '');
        
        const category = getCategoryByName(categoryName);
        const brand = getBrandByName(brandName);
        
        const category_id = String(product.category_id || category?.id || '');
        const brand_id = String(product.brand_id || brand?.id || '');

        return {
            id: String(product.id || ''),
            name: String(product.name || ''),
            slug: String(product.slug || ''),
            category_id,
            brand_id,
            category: category?.name || categoryName,
            brand: brand?.name || brandName,
            price: Number(product.price) || 0,
            salePrice: product.salePrice ? Number(product.salePrice) : null,
            images: Array.isArray(product.images) ? product.images : [],
            specifications,
            description: String(product.description || ''),
            features: Array.isArray(product.features) ? product.features : [],
            inStock: Boolean(product.inStock),
            featured: Boolean(product.featured),
            bestseller: Boolean(product.bestseller),
            createdAt: String(product.createdAt || ''),
            updatedAt: String(product.updatedAt || ''),
            seo: product.seo as ProductSEO | undefined
        };
    };

    const allProducts: Product[] = [
        ...speakersData.speakers.map(normalizeProduct),
        ...amplifiersData.amplifiers.map(normalizeProduct),
        // Add more product types here as needed
    ];
    return allProducts;
}

export async function getCategories(): Promise<Category[]> {
    return categoriesData.categories.sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getBrands(): Promise<Brand[]> {
    // brandsData is now an array directly, not an object with brands property
    return brandsData.map((brand, index) => ({
        ...brand,
        sortOrder: index // Use index as default sortOrder
    }));
}

// Combo products functions
export async function getAllCombos(): Promise<Combo[]> {
    return combosData as Combo[];
}

export async function getFeaturedCombos(limit?: number): Promise<Combo[]> {
    const allCombos = await getAllCombos();
    const featured = allCombos.filter(combo => combo.featured && combo.status === 'active');
    return limit ? featured.slice(0, limit) : featured;
}

export async function getComboBySlug(slug: string): Promise<Combo | null> {
    const allCombos = await getAllCombos();
    return allCombos.find(combo => combo.slug === slug) || null;
}

export async function getComboProducts(combo: Combo): Promise<(Product & { quantity: number; role: string })[]> {
    const allProducts = await getAllProducts();
    return combo.products.map(comboProduct => {
        const product = allProducts.find(p => p.id === comboProduct.id);
        return product ? {
            ...product,
            quantity: comboProduct.quantity,
            role: comboProduct.role
        } : null;
    }).filter(Boolean) as (Product & { quantity: number; role: string })[];
}
