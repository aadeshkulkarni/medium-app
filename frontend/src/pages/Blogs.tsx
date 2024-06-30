import Appbar from '../components/Appbar';
import BlogsList from '../components/BlogsList';
import TopicsSlider from '../components/TopicsSlider';
import { useState } from 'react';
const Blogs = () => {
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  return (
    <>
      <Appbar skipAuthCheck/>
      <TopicsSlider selectedTopic={selectedTopic} setSelectedTopic={setSelectedTopic} />
      <BlogsList />
    </>
  );
};

export default Blogs;
