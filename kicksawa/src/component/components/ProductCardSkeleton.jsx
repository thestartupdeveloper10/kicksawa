import React from 'react';
import { Skeleton } from "@/components/ui/skeleton"
import { useTheme } from './ThemeContext';


const ProductCardSkeleton = () => {
  const { theme } = useTheme();

  return (
    <div className={`border ${theme === 'dark' ? 'border-gray-700 bg-[#130d14]' : 'border-gray-300 bg-white'} p-4 flex flex-col transition-colors`}>
      <div className="relative mb-4">
        <Skeleton className="w-full h-48" />
        <div className="absolute z-30 top-2 right-2 flex space-x-2">
          <Skeleton className="w-7 h-7 rounded-full" />
          <Skeleton className="w-7 h-7 rounded-full" />
        </div>
      </div>
      <Skeleton className="h-4 w-1/3 mb-1 bg-gray-300" />
      <Skeleton className="h-5 w-2/3 mb-2 bg-gray-300" />
      <Skeleton className="h-6 w-1/2 bg-gray-300" />
    </div>
  );
};

export default ProductCardSkeleton;