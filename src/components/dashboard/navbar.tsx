import { Button } from "../ui/button";
import { SidebarTrigger } from "../ui/sidebar";

export default function Navbar(){

    return(
        <header className="flex h-16 shrink-0 items-center gap-2  px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center gap-2 px-4">
            <h1 className="text-lg font-semibold">Good Morning, Alkush</h1>
          </div>
        </header>
    )
}