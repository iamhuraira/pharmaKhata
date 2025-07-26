import ProductCard from './ProductCard';
import { IProduct } from "@/types/products";
import { useGetAllProducts } from "@/hooks/products";
import {useState} from "react";
import Skeleton from "react-loading-skeleton";

const ProductList = () => {
    const { products, isLoading, isError, error } = useGetAllProducts();
    const [searchQuery, setSearchQuery] = useState('');


    if (isLoading) return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 5 }).map((_, index) => (
            <div
                key={index}
                className="bg-white rounded-lg shadow-md p-2 border border-gray-200"
            >
                {/* Name Skeleton */}
                <Skeleton height={28} className="mb-1" />

                {/* Short Description Skeleton */}
                <Skeleton count={2} className="mb-1" />

                {/* Urdu Description Skeleton */}
                {/*<Skeleton height={20} className="mb-1 w-3/4 ml-auto" />*/}

                {/* Price and Stock Skeleton */}
                <div className="flex justify-between items-center mt-1">
                    <div className="flex items-center gap-2">
                        <Skeleton width={100} height={24} />
                        <Skeleton width={50} height={20} />
                    </div>
                    <Skeleton width={100} height={28} />
                </div>
            </div>
        ))}
    </div>


    if (isError) return <div>Error: {error}</div>;

    const filteredProducts = products.filter(product => {
        const searchLower = searchQuery.toLowerCase();
        return (
            product.name.toLowerCase().includes(searchLower) ||
            product.shortDescription?.toLowerCase().includes(searchLower) ||
            product.urduDescription?.includes(searchQuery) // Urdu doesn't need lowercase
        );
    });

    return (
        <div className="space-y-6">
            {/* Search Input */}
            <div className="">
                <input
                    type="text"
                    placeholder="Search products..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
                <div className="text-gray-500">No products found matching your search.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map((product: IProduct) => (
                        <ProductCard
                            key={product._id.toString()}
                            product={product}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductList;