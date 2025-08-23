import ProductCard from './ProductCard';
import { IProduct } from "@/types/products";
import { useGetAllProducts } from "@/hooks/products";
import { useState } from "react";
import Skeleton from "react-loading-skeleton";
import { Select, Input } from 'antd';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';

const ProductList = () => {
    const { products, isLoading, isError, error } = useGetAllProducts();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');


    if (isLoading) return (
        <div className="space-y-6">
            {/* Search and Filter Skeletons */}
            <div className="flex flex-col sm:flex-row gap-4">
                <Skeleton height={40} className="flex-1" />
                <Skeleton height={40} className="w-full sm:w-48" />
            </div>
            
            {/* Results Counter Skeleton */}
            <Skeleton height={20} className="w-48" />
            
            {/* Products Grid Skeleton - Mobile Optimized */}
            <div className="grid grid-cols-1 gap-4">
                {Array.from({ length: 4 }).map((_, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-xl shadow-lg p-3 border-0 min-h-[160px]"
                    >
                        {/* Header Skeleton */}
                        <div className="pr-16">
                            <Skeleton height={20} className="mb-1" />
                            <div className="mb-1">
                                <Skeleton height={20} className="w-20" />
                            </div>
                            <Skeleton count={1} className="mb-2" />
                        </div>
                        
                        {/* Footer Skeleton */}
                        <div className="mt-auto pt-2 border-t border-gray-200/50 bg-gradient-to-t from-gray-50/50 to-transparent">
                            <div className="flex items-center justify-between mb-2">
                                <Skeleton height={20} className="w-16" />
                                <Skeleton height={20} className="w-12" />
                            </div>
                            <Skeleton height={32} className="w-full" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );


    if (isError) return (
        <div className="text-center py-8">
            <div className="text-red-500 text-lg mb-2">Error loading products</div>
            <div className="text-gray-600 text-sm">{error}</div>
            <button 
                onClick={() => window.location.reload()} 
                className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
                Try Again
            </button>
        </div>
    );

    // Get unique categories for filter dropdown
    const categories = Array.from(new Set(products.map(product => 
      typeof product.categoryId === 'object' ? product.categoryId?.name || 'Uncategorized' : 'Uncategorized'
    ))).sort();

    const filteredProducts = products.filter(product => {
        const matchesSearch = searchQuery === '' || (
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.shortDescription?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.urduDescription?.includes(searchQuery) // Urdu doesn't need lowercase
        );
        
        const matchesCategory = selectedCategory === 'all' || 
          (typeof product.categoryId === 'object' ? product.categoryId?.name : product.categoryId) === selectedCategory;
        
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="space-y-6">
            {/* Search and Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-4">
                {/* Search Input */}
                <div className="flex-1">
                    <Input
                        size="large"
                        placeholder="Search products by name, description..."
                        prefix={<SearchOutlined />}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full"
                    />
                </div>
                
                {/* Category Filter */}
                <div className="w-full sm:w-48">
                    <Select
                        size="large"
                        placeholder="Filter by category"
                        prefix={<FilterOutlined />}
                        value={selectedCategory}
                        onChange={setSelectedCategory}
                        className="w-full"
                        options={[
                            { value: 'all', label: 'All Categories' },
                            ...categories.map(cat => ({ value: cat, label: cat }))
                        ]}
                    />
                </div>
            </div>

            {/* Results Counter */}
            <div className="text-sm text-gray-600">
                Showing {filteredProducts.length} of {products.length} products
                {selectedCategory !== 'all' && ` in "${selectedCategory}" category`}
                {searchQuery && ` matching "${searchQuery}"`}
            </div>

            {/* Products Grid - Mobile Optimized */}
            {filteredProducts.length === 0 ? (
                <div className="text-center py-8">
                    <div className="text-gray-500 text-lg mb-2">
                        {searchQuery || selectedCategory !== 'all' 
                            ? 'No products found matching your criteria.'
                            : 'No products available.'
                        }
                    </div>
                    <div className="text-gray-400 text-sm">
                        Try adjusting your search or filter criteria.
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredProducts.map((product: IProduct, index: number) => (
                        <ProductCard
                            key={product._id?.toString() || `product-${index}`}
                            product={product}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductList;