import React from 'react';

const TopicsSkeleton: React.FC = () => {
  return (
    <div className="flex overflow-x-auto scrollbar-hide space-x-8 p-2">
      {Array.from({ length: 10 }).map((_, index) => (
        <div key={index} className="flex-shrink-0 px-8 py-2 bg-sub rounded-lg animate-pulse">
          &nbsp;
        </div>
      ))}
    </div>
  );
};

export default TopicsSkeleton;
