import React from 'react';
import { Skeleton } from "@/components/ui/skeleton"
import { useTheme } from './ThemeContext';

const SneakerItemSkeleton = ({ isImageRight }) => {
  const { theme } = useTheme();

  const ImageSkeleton = () => (
    <div className="w-full md:w-1/3 mb-4 md:mb-0">
      <Skeleton className="w-full h-64 md:h-80 bg-gray-300" />
    </div>
  );

  const ContentSkeleton = () => (
    <div className="w-full md:w-2/3 md:px-6">
      <Skeleton className="h-8 w-3/4 mb-2 bg-gray-300" />
      <Skeleton className="h-4 w-full mb-2 bg-gray-300" />
      <Skeleton className="h-4 w-full mb-2 bg-gray-300" />
      <Skeleton className="h-4 w-2/3 mb-4 bg-gray-300" />
      <div className="flex space-x-4">
        <Skeleton className="h-10 w-40 bg-gray-300" />
        <Skeleton className="h-10 w-40 bg-gray-300" />
      </div>
    </div>
  );

  return (
    <div className={`flex flex-col md:flex-row items-center mb-12 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
      {!isImageRight && <ImageSkeleton />}
      <ContentSkeleton />
      {isImageRight && <ImageSkeleton />}
    </div>
  );
};

export default SneakerItemSkeleton;