const Quote = () => {
  return (
    <div className="bg-main flex justify-center items-center text-center w-full h-screen md:h-auto">
      <div className="w-full px-4">
        <h1 className="text-md md:text-2xl text-center font-light md:tracking-wide leading-6 md:leading-8 text-main">
          " To laugh often and much: To win the respect of intelligent people and the affection of children, to earn the
          appreciation of honest critics and endure the betrayal of false friends; to appreciate beauty, to find the
          best in others, to leave the world a bit better whether by a healthy child, a garden patch, or a redeemed
          social condition; to know even one life has breathed easier because you lived. This is to have succeeded."
        </h1>
        <h6 className="font-bold mt-4 text-main">Ralph Waldo Emerson</h6>
        <h6>artofpoets.com</h6>
      </div>
    </div>
  );
};

export default Quote;
