import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Spinner from './components/Spinner';
import { RecoilRoot } from 'recoil';

const Home = lazy(() => import('./pages/Home'));
const Signup = lazy(() => import('./pages/Signup'));
const Signin = lazy(() => import('./pages/Signin'));
const Blog = lazy(() => import('./pages/Blog'));
const Blogs = lazy(() => import('./pages/Blogs'));
const Publish = lazy(() => import('./pages/Publish'));
const Edit = lazy(() => import('./pages/Edit'));
const Bookmarks = lazy(() => import('./pages/Bookmarks'));
const User = lazy(() => import('./pages/User'));
const Contributor = lazy(() => import('./pages/Contributor'));

function App() {
  return (
    <BrowserRouter>
    <RecoilRoot>
      <Suspense
        fallback={
          <div className="w-screen h-screen flex justify-center items-center">
            <Spinner />
          </div>
        }
      >
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/blog/:id" element={<Blog />} />
          <Route path="/publish" element={<Publish />} />
          <Route path="/edit/:id" element={<Edit />} />
          <Route path="/bookmarks" element={<Bookmarks />} />
          <Route path="/profile/:id" element={<User />} />
          <Route path="/contributors" element={<Contributor />} />
          <Route path="/" element={<Home />} />
        </Routes>
      </Suspense>
      </RecoilRoot>
    </BrowserRouter>
  );
}

export default App;
