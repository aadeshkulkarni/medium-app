import ReactQuill from 'react-quill';
import { Link } from 'react-router-dom';
import 'react-quill/dist/quill.bubble.css';
import { formatDateString, getPlainTextFromHTML } from '../util/string';
import Avatar from './Avatar';
import { Pill } from './Pill';

interface BlogCardProps {
  author: {
    name: string;
    profilePic?: string;
  };
  title: string;
  content: string;
  publishedDate: string;
  id: string;
  fullWidth?: boolean;
  tagsOnPost: Array<any>;
}

const BlogCard = ({ author, title, content, publishedDate, id, fullWidth, tagsOnPost }: BlogCardProps) => {
  // split and slice combination is added so that the string doesn't get trimmed in middle of a word
  const quillContent = getPlainTextFromHTML(content).split(' ')?.slice(0, 100).join(' ') + '...';

  return (
    <Link
      to={`/blog/${id}`}
      className={`snap-center min-h-screen md:min-h-min md:h-min blog-card md:px-4 md:py-8 ${fullWidth ? 'w-full' : 'w-full md:w-3/6'} md:border-b md:border-gray-200 my-1 bg-main shadow-b-sm flex flex-col justify-between md:grid md:grid-cols-12 md:gap-6 lg:gap-0`}
    >
      <div className="order-2 flex flex-col md:order-none md:col-span-9 p-4 md:px-4">
        <div className="order-3 md:order-none flex items-center gap-4">
          <Avatar name={author?.name || ''} imageSrc={author?.profilePic} />
          <div>
            <span className='text-main'>{author?.name}</span> ·{' '}
            <span className="text-sm text-slate-500">{formatDateString(publishedDate)}</span>
          </div>
        </div>
        <div className="order-1 md:order-none text-xl font-bold pt-4">{title}</div>
        <div className="order-2 md:order-none tracking-wide py-4 text-slate-600">
          <ReactQuill value={quillContent} readOnly={true} theme={'bubble'} />
        </div>
      </div>
      <div className="order-1 md:order-none col-span-0 md:col-span-3 md:p-4 flex justify-center items-center">
        <ArticleImage uniqueId={id} />
      </div>
      <div className="order-3 md:order-none md:flex col-span-full pb-8 px-2 border-b md:border-none border-gray-100">
        <div className="flex items-center">
          {tagsOnPost?.slice(0, 2).map((tagWrapper) => {
            return <Pill key={tagWrapper.tag.id} id={tagWrapper.tag.id} tagName={tagWrapper.tag.tagName} />;
          })}
          <div className="text-gray-600 ">{Math.ceil(content.length / 300)} min read</div>
        </div>
      </div>
    </Link>
  );
};

export default BlogCard;

function ArticleImage({ uniqueId }: { uniqueId: string }) {
  return (
    <object data={`https://picsum.photos/300/300?random=${uniqueId}`} type="image/jpeg" className="w-full">
      <div className="bg-gray-50 w-[100%] animate-pulse aspect-square"></div>
    </object>
  );
}
