import { MutatingDots } from "react-loader-spinner";

const Loader = () => {
  return (
    <div className="flex justify-center items-center h-screen">
      <MutatingDots height="80" width="80" color="#4f39f6"  secondaryColor="#ff8c00" />
    </div>
  );
};

export default Loader;
