import { useState,useEffect } from 'react';
import ReactQuill from 'react-quill';
import { toast } from 'react-toastify';
import { useBlog } from './../../hooks';
import { useNavigate, useParams } from 'react-router-dom';
import BookmarkIcon from '../icons/Bookmark';
import BookmarkSolid from '../icons/BookmarkSolid';
import Tooltip from '../Tooltip';
import Modal from '../Modal';
import 'react-quill/dist/quill.bubble.css';
import RemoveIcon from '../icons/Remove';
import EditIcon from '../icons/Edit';
import SingleBlogSkeleton from '../../skeletons/SingleBlogSkeleton';
import { Tags } from '../Tags';
import ClapButton from '../ClapButton';
import Avatar from '../Avatar';
import { formatDateString } from '../../util/string';
import VoiceOver from '../VoiceOver';
import { getPlainTextFromHTML } from '../../util/string';
import ChatModule from '../ChatModule';
import { Loadable, useRecoilValueLoadable } from 'recoil';
import { blogAtom } from '../../store/atoms/singleblog';
import { Post } from '../../types/post';

const Story = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const singlePost:Loadable<Post> = useRecoilValueLoadable(blogAtom(id));
  const loading = singlePost.state==="loading";
  const blog:Post = singlePost.contents


  function handleClickOnAvatar() {
    navigate(`/profile/${blog?.author?.id}`);
  }

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center p-4 md:px-10">
        <SingleBlogSkeleton />
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center p-4 md:px-10">
      <div className="p-4 max-w-[680px]">
        <div className="text-xl md:text-4xl font-extrabold py-4">{blog?.title}</div>
        <AuthorBox
          name={blog?.author?.name}
          details={blog?.author?.details}
          profilePic={blog?.author?.profilePic}
          publishedDate={blog?.publishedDate}
          handleClickOnAvatar={handleClickOnAvatar}
        />
        <ActionBox />
        <div className="pt-4">
          <VoiceOver content={getPlainTextFromHTML(blog?.content)} />
        </div>
        <div className="py-4">
          <ReactQuill value={blog?.content} readOnly={true} theme={'bubble'} />
        </div>
        <ChatModule />
      </div>
      <Tags />
    </div>
  );
};
const ActionBox = () => {
  const navigate = useNavigate();
  const [openUnbookmarkModal, setOpenUnbookmarkModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const { id } = useParams();
  const { blog, deleteBlog, bookmarkBlog, unbookmarkBlog, likeBlog } = useBlog({
    id: id || '',
  });
  
  const [bookmarked, setBookmarked] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}') || {};
  const isAuthor = user?.id && user?.id === blog?.author?.id;

  useEffect(() => {
    if (blog?.bookmarks?.some((bookmark: any) => bookmark.id)) {
      setBookmarked(true);
    }
  }, [blog?.bookmarks, user.id]);

  const deleteStory = async () => {
    if (id) {
      const message = await deleteBlog(id);
      toast.info(message);
      navigate('/blogs');
    }
  };

  const handleBookmark = async () => {
    if (bookmarked) {
      setOpenUnbookmarkModal(true);
    } else {
      await bookmarkBlog();
      setBookmarked(true);
    }
  };

  const onConfirmUnbookmark = async () => {
    const userBookmarks = blog.bookmarks?.filter((bookmark) => bookmark.id ) || [];
    if (userBookmarks.length === 0) {
      console.error("No bookmarks found for the user");
      return;
    }
    for (const bookmark of userBookmarks) {
      await unbookmarkBlog(bookmark.id);
    }
    setBookmarked(false);
    setOpenUnbookmarkModal(false);
  };

  const onConfirmDelete = () => {
    deleteStory();
    setOpenDeleteModal(false);
  };

  const beginEditStory = () => {
    navigate(`/edit/${blog.id}`);
  };
  return (
    <div className="text-slate-500 py-2 items-center justify-between flex border-y border-slate-200">
      <div className="text-sm">
        <ClapButton clapCount={blog?.claps?.length || 0} handleClap={likeBlog} />
      </div>
      <div className="flex justify-center items-center">
        <Tooltip message={bookmarked ? "Unsave" : "Save"}>
          <div onClick={handleBookmark} className="w-10 h-10 p-2 cursor-pointer">
            {bookmarked ? <BookmarkSolid /> : <BookmarkIcon />}
          </div>
        </Tooltip>
        {isAuthor && (
          <>
            <Tooltip message="Edit">
              <button
                onClick={beginEditStory}
                type="button"
                name="edit-story"
                className="focus:outline-none font-medium rounded-lg text-sm px-4"
              >
                <EditIcon />
              </button>
            </Tooltip>
            <Tooltip message="Remove">
              <button
                onClick={() => setOpenDeleteModal(true)}
                type="button"
                name="delete-story"
                className="focus:outline-none font-medium rounded-lg text-sm px-2"
              >
                <RemoveIcon />
              </button>
            </Tooltip>
          </>
        )}
      </div>
      <Modal
        message={'Are you sure that you want to unbookmark this post?'}
        openModal={openUnbookmarkModal}
        onConfirm={onConfirmUnbookmark}
        onCloseModal={() => setOpenUnbookmarkModal(false)}
      />
      <Modal
        message={'Are you sure that you want to delete this post?'}
        openModal={openDeleteModal}
        onConfirm={onConfirmDelete}
        onCloseModal={() => setOpenDeleteModal(false)}
      />
    </div>
  );
};

const AuthorBox = ({
  name,
  details,
  profilePic,
  publishedDate,
  handleClickOnAvatar,
}: {
  name: string;
  details: string | undefined;
  publishedDate: string;
  profilePic?: string;
  handleClickOnAvatar: React.MouseEventHandler<HTMLDivElement>;
}) => (
  <div className="p-4">
    <div className="flex items-center gap-4 py-4">
      <Avatar name={name || 'Anonymous'} onClick={handleClickOnAvatar} imageSrc={profilePic} />
      <div>
        <div className="font-bold">{name || 'Anonymous'}</div>
        <div>
          <span>{details ? details : 'An artist at living. My work of art is my life.'} </span> ·{' '}
          <span className="text-sm text-slate-500">{formatDateString(publishedDate)}</span>
        </div>
      </div>
    </div>
  </div>
);
export default Story;