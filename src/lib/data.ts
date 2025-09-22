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

export interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    author: string;
    publishedAt: string;
    updatedAt: string;
    featuredImage?: string;
    tags: string[];
    category: string;
    published: boolean;
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
    readingTime?: number;
}

export interface ComboProduct {
    id: string;
    quantity: number;
    role: 'main' | 'accessory';
}

export interface ComboMedia {
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
export function getCategoryByName(name: string): Category | undefined {
    return categoriesData.categories.find(cat => 
        cat.name.toLowerCase() === name.toLowerCase() || 
        cat.slug.toLowerCase() === name.toLowerCase()
    );
}

export function getBrandByName(name: string): Brand | undefined {
    return brandsData.find(brand => 
        brand.name.toLowerCase() === name.toLowerCase() || 
        brand.slug.toLowerCase() === name.toLowerCase()
    );
}

export function getCategoryById(id: string): Category | undefined {
    return categoriesData.categories.find(cat => cat.id === id);
}

export function getBrandById(id: string): Brand | undefined {
    return brandsData.find(brand => brand.id === id);
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
    // brandsData is now an array directly, not an object with brands property
    return brandsData.map((brand, index) => ({
        ...brand,
        sortOrder: index // Use index as default sortOrder
    }));
}

// Blog functions
export async function getBlogPosts(published: boolean = true): Promise<BlogPost[]> {
    // Mock data for now - will be replaced with actual data source
    const mockPosts: BlogPost[] = [
        {
            id: "1",
            title: "Hướng dẫn chọn mua thiết bị âm thanh chất lượng tại Quảng Ngãi",
            slug: "huong-dan-chon-mua-thiet-bi-am-thanh-chat-luong-tai-quang-ngai",
            excerpt: "Bài viết hướng dẫn chi tiết cách chọn mua thiết bị âm thanh chất lượng, phù hợp với nhu cầu và ngân sách tại khu vực Quảng Ngãi.",
            content: `# Hướng dẫn chọn mua thiết bị âm thanh chất lượng

Việc chọn mua thiết bị âm thanh phù hợp không chỉ đơn thuần là chọn sản phẩm có giá cả hợp lý mà còn cần cân nhắc nhiều yếu tố khác...`,
            author: "Tiến Đạt Audio",
            publishedAt: "2025-09-10T00:00:00Z",
            updatedAt: "2025-09-10T00:00:00Z",
            featuredImage: "/images/blog/chon-mua-thiet-bi-am-thanh.jpg",
            tags: ["thiết bị âm thanh", "hướng dẫn", "quảng ngãi"],
            category: "Hướng dẫn",
            published: true,
            metaTitle: "Hướng dẫn chọn mua thiết bị âm thanh chất lượng tại Quảng Ngãi",
            metaDescription: "Bài viết hướng dẫn chi tiết cách chọn mua thiết bị âm thanh chất lượng, phù hợp với nhu cầu tại Quảng Ngãi",
            keywords: ["thiết bị âm thanh", "quảng ngãi", "hướng dẫn mua hàng"],
            readingTime: 5
        }
    ];

    return published ? mockPosts.filter(post => post.published) : mockPosts;
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
    const posts = await getBlogPosts(false);
    return posts.find(post => post.slug === slug) || null;
}

export async function getFeaturedBlogPosts(limit: number = 3): Promise<BlogPost[]> {
    const posts = await getBlogPosts();
    return posts.slice(0, limit);
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
