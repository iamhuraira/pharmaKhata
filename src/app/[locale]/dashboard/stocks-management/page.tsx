import React from "react";

import type { Metadata } from "next";
import StocksManagement from "@/components/stocks-management/StocksManagement";

export const metadata: Metadata = {
    title: "Stocks",
    description: "Stock Management",
};
const StockManagement = () => {

    return (
        <>
           <StocksManagement/>
        </>
    );
};

export default StockManagement;
