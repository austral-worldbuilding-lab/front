import { ReactNode } from "react";
import UsefulFilesHeader from "./UsefulFilesHeader";

interface UsefulFilesContainerProps {
  children: ReactNode;
}

const UsefulFilesContainer = ({ children }: UsefulFilesContainerProps) => {
  return (
    <div className="flex flex-col gap-6 border-gray-200 p-4 rounded-[12px] border bg-white">
      <UsefulFilesHeader />
      {children}
    </div>
  );
};

export default UsefulFilesContainer;
