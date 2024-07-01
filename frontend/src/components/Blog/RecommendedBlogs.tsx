import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRecommendedBlogs } from '../../hooks';
import ArticleImage from '../ArticleImage';
import { formatDateString } from '../../util/string';
import { Pill } from '../Pill';
import Avatar from '../Avatar';
import { Post } from '../../types/post'; 

interface RecommendedBlogsProps {
  authorName: string;
}

const RecommendedBlogs: React.FC<RecommendedBlogsProps> = ({ authorName }) => {
  const { id } = useParams();
  const { loading, recommendedBlogs } = useRecommendedBlogs({ blogId: id || '' });
  const navigate = useNavigate();

  if (loading) {
    return <div>Loading...</div>;
  }

  const uniqueBlogs = Array.from(new Set(recommendedBlogs.map(blog => blog.id)))
    .map(id => recommendedBlogs.find(blog => blog?.id === id))
    .filter((blog): blog is Post => blog !== undefined);

  const handleNavigation = (blogId: string) => {
    navigate(`/blog/${blogId}`);
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }, 300);
  };

  return (
    <div className="mt-6 p-6 bg-white rounded-lg max-w-3xl mx-auto">
      <div className="text-2xl font-semibold mb-6 text-gray-800">Read more blogs.</div>
      <hr className="mb-6 border-gray-300" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {uniqueBlogs.map((blog) => (
          <div
            key={blog.id}
            className="flex flex-col p-4 border rounded-lg cursor-pointer hover:shadow-lg transition-shadow duration-300"
            onClick={() => handleNavigation(blog.id)}
          >
            <ArticleImage uniqueId={blog.id} />
            <h3 className="text-lg font-semibold mt-2 overflow-hidden whitespace-nowrap text-overflow-ellipsis">{blog.title}</h3>
            <div className="flex items-center gap-4 mt-2">
              <Avatar name={blog.author?.name || authorName || ''} imageSrc={blog.author?.profilePic} />
              <div>
                <span>{blog.author?.name || authorName || 'Unknown Author'}</span> ·{' '}
                <span className="text-sm text-gray-500">{formatDateString(blog.publishedDate)}</span>
              </div>
            </div>
            <div className="flex flex-wrap mt-2">
              {blog.tagsOnPost?.map((tagWrapper) => (
                <Pill key={tagWrapper.tag.id} id={tagWrapper.tag.id} tagName={tagWrapper.tag.tagName} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendedBlogs;