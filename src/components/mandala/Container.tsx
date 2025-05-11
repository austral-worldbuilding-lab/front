import Mandala from "./Mandala";

const Container = () => {
  return (
    <div className="relative w-full h-[calc(100vh-120px)] border rounded-lg overflow-hidden bg-white">
      <div className="w-full h-full overflow-hidden">
        <Mandala />
      </div>
    </div>
  );
};

export default Container;
