import { useEffect, useMemo, useState } from 'react';
import { BACKEND_URL } from '../config';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { BlogResponse } from '../types/blog';
import { Post } from '../types/post';
import { useSearchParams } from 'react-router-dom';

const PAGE_SIZE = 10;

export const useBlogs = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<BlogResponse[]>([]);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(0);

  const [searchParams] = useSearchParams();
  const tagId = searchParams.get('tag');

  const resetPage = () => {
    setPage(1);
  };
  const fetchBlogs = async () => {
    setLoading(true);

    let queryString = '';
    if (tagId) {
      queryString = `tagId=${tagId}`;
    }

    const response = await axios.get(
      `${BACKEND_URL}/api/v1/blog/bulk?page=${page}&pageSize=${PAGE_SIZE}&${queryString}`
    );

    setData((prev) => {
      const dataExists = prev.find((item) => item.page === page);
      if (dataExists) {
        const updatedPayload = prev.map((item) => {
          if (item.page === page) {
            return response.data;
          } else {
            return item;
          }
        });
        return updatedPayload;
      } else {
        return [...prev, response?.data || {}];
      }
    });
    setTotalPage(response?.data?.totalPages);
    setLoading(false);
  };

  useEffect(() => {
    fetchBlogs();
  }, [page, tagId]);

  const blogs = useMemo(() => {
    return data.flatMap((item) => item?.posts ?? []);
  }, [data]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    if (nextPage <= totalPage) {
      setPage(nextPage);
    }
  };

  return {
    loading,
    blogs,
    handleLoadMore,
    resetPage,
  };
};

export const useBlog = ({ id }: { id: string }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [blog, setBlog] = useState<Post>({
    id: '',
    title: '',
    content: '',
    publishedDate: '',
    author: {
      id: '',
      name: '',
      email: '',
      details: '',
      profilePic: '',
    },
    claps: [],
    tagsOnPost: [],
    bookmarks: [],
    published: true,
  });

  async function fetchBlog() {
    const token = localStorage.getItem('token');
    // if (!token) {
    //   navigate('/signup');
    // }
    const response = await axios.get(`${BACKEND_URL}/api/v1/blog/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    setBlog(response.data.post);
    setLoading(false);
  }

  useEffect(() => {
    fetchBlog();
  }, [id]);

  async function deleteBlog(blogId: string) {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/signin');
    }
    const response = await axios.delete(`${BACKEND_URL}/api/v1/blog/${blogId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.message;
  }

  async function editBlog({ id, title, content }: { id: string; title: string; content: string }) {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/signin');
    }
    setLoading(true);
    try {
      const response = await axios.put(
        `${BACKEND_URL}/api/v1/blog`,
        {
          id: id,
          title: title,
          content: content,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (e) {
      return { error: 'An error has occurred trying to edit the blog' };
    } finally {
      setLoading(false);
    }
  }

  async function bookmarkBlog() {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/signin');
    }
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/v1/bookmark`,
        {
          blogId: id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchBlog();
      return response.data;
    } catch (e) {
      return { error: 'An error has occurred trying to bookmark the blog' };
    }
  }

  async function unbookmarkBlog(bookmarkId: string) {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/signin');
    }
    try {
      const response = await axios.delete(`${BACKEND_URL}/api/v1/bookmark/${bookmarkId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchBlog();
      return response.data;
    } catch (e) {
      return { error: 'An error has occurred trying to unbookmark the blog' };
    }
  }

  async function likeBlog() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/signin');
      }
      const response = await axios.post(
        `${BACKEND_URL}/api/v1/clap`,
        {
          blogId: id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchBlog();
      return response.data;
    } catch (e) {
      return { error: 'An error has occurred trying to like the blog' };
    }
  }

  return {
    loading,
    blog,
    deleteBlog,
    editBlog,
    bookmarkBlog,
    unbookmarkBlog,
    likeBlog,
  };
};

export const useBookmarks = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [bookmarks, setBookmarks] = useState([]);

  useEffect(() => {
    async function fetchBookmarks() {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/signin');
      }
      const response = await axios.get(`${BACKEND_URL}/api/v1/bookmark`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setBookmarks(response.data.payload);
      setLoading(false);
    }
    fetchBookmarks();
  }, []);

  return {
    loading,
    bookmarks,
  };
};
export const useRecommendedBlogs = ({ blogId }: { blogId: string }) => {
  const [recommendedBlogs, setRecommendedBlogs] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendedBlogs = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/v1/blog/recommendation/${blogId}`);
        setRecommendedBlogs(response.data.recommendedBlogs);
      } catch (error) {
        console.error('Error fetching recommended blogs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendedBlogs();
  }, [blogId]);

  return {
    loading,
    recommendedBlogs,
  };
};