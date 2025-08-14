import type { IAPIResponse, IAPISuccess } from '@/types/api';

export type IProduct = {
  _id: string;
  name: string;
  shortDescription?: string;
  urduDescription?: string;
  quantity: number;
  categoryId: {
    _id: string;
    name: string;
    urduName?: string;
    description?: string;
  };
  size?: number;
  packType: string;
  price: number;
  createdAt: Date;
  updatedAt: Date;
};
export type IGetAllProductsResponse = {
  products: IProduct[];
} & IAPIResponse;

export type TGetAllProductService = () => Promise<IGetAllProductsResponse>;
export type TUpdateProductQuantityService = (payload: {
  productId: string;
  quantity: number;
}) => Promise<IAPISuccess>;
