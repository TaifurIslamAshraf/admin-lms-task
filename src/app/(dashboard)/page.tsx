import NavHeader from "@/components/NavHeader";
import {SectionCards} from "@/components/section-cards"

const bread = [
  {
    href: "/",
    text: "Dashboard",
    last: true,
  },
];

export default function Page() {
  return (
  <div className="">
     <NavHeader bread={bread} />
     <SectionCards />
  </div>
  );
}
