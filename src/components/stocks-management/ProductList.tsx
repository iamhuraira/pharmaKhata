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
            
            {/* Products Grid Skeleton - Desktop Optimized */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 min-h-[280px]"
                    >
                        {/* Header Skeleton */}
                        <div className="pr-20">
                            <Skeleton height={24} className="mb-3" />
                            <div className="mb-3">
                                <Skeleton height={24} className="w-24" />
                            </div>
                            <Skeleton count={2} className="mb-3" />
                        </div>
                        
                        {/* Footer Skeleton */}
                        <div className="mt-auto pt-4 border-t border-gray-200/50 bg-gradient-to-t from-gray-50/50 to-transparent">
                            <div className="flex items-center justify-between mb-4">
                                <Skeleton height={24} className="w-20" />
                                <Skeleton height={24} className="w-16" />
                            </div>
                            <Skeleton height={48} className="w-full" />
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
            <div className="flex flex-col lg:flex-row gap-4">
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
                <div className="w-full lg:w-64">
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
            <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                    Showing <span className="font-semibold text-gray-900">{filteredProducts.length}</span> of <span className="font-semibold text-gray-900">{products.length}</span> products
                    {selectedCategory !== 'all' && ` in "${selectedCategory}" category`}
                    {searchQuery && ` matching "${searchQuery}"`}
                </div>
                <div className="text-xs text-gray-500">
                    Last updated: {new Date().toLocaleTimeString()}
                </div>
            </div>

            {/* Products Grid - Desktop Optimized */}
            {filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">📦</div>
                    <div className="text-gray-500 text-xl mb-2">
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
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
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