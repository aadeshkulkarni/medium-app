import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Appbar from '../components/Appbar';
import { GITHUB_CONTRIBUTOR_URL } from '../config';
import { SkeletonContributorGrid } from '../skeletons/SkeletonContributor';
import { Link } from 'react-router-dom';
interface ContributorProp {
  id: string;
  html_url: string;
  avatar_url: string;
  login: string;
  contributions: string;
}

const Contributors: React.FC = () => {
  const [contributors, setContributors] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(GITHUB_CONTRIBUTOR_URL);
        setContributors(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching contributors', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <Appbar skipAuthCheck={true}/>
      <ContributionNotification />
      <div className="p-4 flex flex-col justify-center items-center w-screen">
        <h1 className="text-2xl mb-4">Contributors</h1>
        {loading ? <SkeletonContributorGrid /> : <ContributorsList contributors={contributors} />}
      </div>
    </>
  );
};

const ContributionNotification = () => (
  <div className="w-full p-4 text-center bg-main text-main border-b">
    <div className="py-4">If you would like to contribute to the project, you can do it by clicking on this link.</div>
    <Link
      className="px-4 py-2 bg-black text-white rounded-full text-xs"
      to="https://github.com/aadeshkulkarni/medium-app"
    >
      Contribute
    </Link>
  </div>
);

const ContributorsList = ({ contributors }: { contributors: ContributorProp[] }) => (
  <div className="md:w-3/5 grid grid-cols-12 gap-4">
    {contributors.map((contributor: any) => (
      <ContributorCard key={contributor?.id} contributor={contributor} />
    ))}
  </div>
);

const ContributorCard = ({ contributor }: { contributor: ContributorProp }) => {
  return (
    <a
      key={contributor?.id}
      href={contributor?.html_url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col col-span-12 md:col-span-3 transform transition-transform duration-300 hover:scale-105 border shadow-sm text-main bg-main"
    >
      <img src={contributor?.avatar_url} alt={contributor?.login} className="w-full  object-cover" />
      <div className="text-left p-2">
        <h2 className="text-lg font-medium text-nowrap overflow-hidden text-ellipsis">{contributor.login}</h2>
        <h2>Developer</h2>
        <p className="text-sub text-nowrap overflow-hidden text-ellipsis">{contributor?.contributions} contributions</p>
      </div>
    </a>
  );
};

export default Contributors;
