import Image from "next/image";
import { setSearchQuery } from "@/redux/slices/searchSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";

type IProps = {
  className?: string;
};

export default function SearchInput({ className }: IProps) {
  const dispatch = useDispatch();
  const searchQuery = useSelector((state: RootState) => state.search.query);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchQuery(e.target.value)); // Update global search query
  };

  return (
    <div
      className={`flex h-[50px] w-[480px] items-center gap-2 rounded-lg border border-[#9E9E9E] bg-white px-4 py-0 ${className}`}
    >
      <Image
        src="/assets/icons/search.svg"
        alt="search icon"
        className=" size-[18px] "
        width={1000}
        height={1000}
      />
      <input
        type="text"
        value={searchQuery}
        onChange={handleInputChange}
        className="size-full border-none bg-transparent  text-[14px] placeholder:[font-size:14px] focus:outline-none"
        placeholder="Search For Something..."
      />
    </div>
  );
}
