// ArticleImage.tsx
import React from 'react';

interface ArticleImageProps {
  uniqueId: string;
}

const ArticleImage: React.FC<ArticleImageProps> = ({ uniqueId }) => {
  return (
    <object data={`https://picsum.photos/300/300?random=${uniqueId}`} type="image/jpeg" className="w-full">
      <div className="bg-gray-50 w-[100%] animate-pulse aspect-square"></div>
    </object>
  );
};

export default ArticleImage;
