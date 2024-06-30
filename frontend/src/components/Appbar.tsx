import { Link, useLocation, useNavigate } from 'react-router-dom';
import WriteIcon from './icons/Write';
import ProfileBox from './ProfileBox';
import Search from './Search';
import { ModeToggle } from './ui/mode-toggle';
import { useState } from 'react';
import HamburgerMenu from './icons/HamburgerMenu';

interface AppbarProps {
  skipAuthCheck?: boolean;
  pageActions?: JSX.Element;
  hideWriteAction?: boolean;
  shouldSnapCenter?: string;
  pathname?: string;
  isUserLoggedIn?: boolean;
}

const Appbar = ({ skipAuthCheck = false, pageActions, hideWriteAction = false }: AppbarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const shouldSnapCenter = location.pathname === '/' || location.pathname === '/blogs' ? 'snap-center' : '';
  const { pathname } = useLocation();
  const isUserLoggedIn = localStorage.getItem('token');
  const [menuOpen, setMenuOpen] = useState(false);


  if (!isUserLoggedIn && skipAuthCheck == false) {
    navigate('/signin');
  }
  return (
    <div className={`${shouldSnapCenter} border-b border-slate-100 flex justify-between items-center p-4 md:px-16`}>
    <div className="flex items-center gap-4">
      <Link to="/" className="text-lg md:text-xl font-medium">
        <span className="text-gray-500">Figuring</span>
        <span className="text-slate-700">out</span>
        <span className="text-green-700">.Life</span>
      </Link>
      <Search />
    </div>

    <div className="flex items-center gap-4">
      <div className="md:hidden flex items-center">
        <button onClick={() => setMenuOpen(!menuOpen)} className="focus:outline-none">
          <HamburgerMenu />
        </button>
      </div>

      <div className="hidden md:flex items-center gap-1">
        {pathname === '/' && (
          <Link
            className="hidden sm:flex focus:outline-none hover:bg-sub rounded-3xl focus:ring-4 focus:ring-gray-100 font-medium items-center gap-2 text-sm px-5 py-2.5"
            to="/contributors"
          >
            Contributors
          </Link>
        )}

        {isUserLoggedIn ? (
          <>
            {!hideWriteAction && (
              <Link to="/publish">
                <button
                  type="button"
                  className="focus:outline-none hover:bg-sub rounded-3xl focus:ring-4 focus:ring-gray-100 font-medium flex items-center gap-2 text-sm px-3 md:px-5 py-2.5"
                >
                  <WriteIcon /> Write
                </button>
              </Link>
            )}
            {pageActions}
            <div className="ml-4">
              <ProfileBox />
            </div>
          </>
        ) : (
          <div className="flex space-x-4">
            <Link
              to="/signup"
              className="focus:outline-none whitespace-nowrap text-white bg-gray-700 hover:bg-gray-800 focus:ring-4 focus:ring-gray-300 font-medium rounded-3xl text-sm px-5 py-2.5"
            >
              Sign Up
            </Link>
            <Link
              to="/signin"
              className="focus:outline-none whitespace-nowrap text-gray-700 border border-gray-700 hover:bg-gray-800 hover:text-gray-50 focus:ring-4 focus:ring-gray-300 font-medium rounded-3xl text-sm px-5 py-2.5"
            >
              Sign In
            </Link>
          </div>
        )}
      </div>

      <div className="flex items-center">
        <ModeToggle />
      </div>
    </div>

    {menuOpen && (
      <div className="absolute top-16 right-4 bg-main border shadow-md p-4 rounded-lg md:hidden z-50">
        <div className="flex flex-col space-y-4">
          {pathname === '/' && (
            <Link
              className="text-main hover:text-sub"
              to="/contributors"
            >
              Contributors
            </Link>
          )}

          {isUserLoggedIn ? (
            <>
              {!hideWriteAction && (
                <Link to="/publish" className="text-main hover:text-sub">
                  Write
                </Link>
              )}
              <div className="text-main hover:text-sub">
                {pageActions}
              </div>
              <div className="text-main hover:text-sub">
                Profile
              </div>
            </>
          ) : (
            <div className="flex flex-col space-y-4">
              <Link
                to="/signup"
                className="text-main hover:text-sub"
              >
                Sign Up
              </Link>
              <Link
                to="/signin"
                className="text-main hover:text-sub"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    )}
  </div>
  );
};

export default Appbar;
