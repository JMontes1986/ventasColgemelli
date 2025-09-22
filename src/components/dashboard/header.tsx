
"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMockAuth } from "@/hooks/use-mock-auth";
import type { NavItem } from "./sidebar-nav";
import Link from "next/link";
import { Logo } from "../icons";
import { useRouter } from "next/navigation";
import { TopNav } from "./top-nav";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Package2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

export function Header({ navItems }: { navItems: NavItem[] }) {
  const { currentUser, isMounted, logout } = useMockAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  if (!isMounted) {
    return (
       <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
         {/* Skeleton or minimal loader */}
       </header>
    );
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
      <div className="flex items-center gap-4">
        <div className="md:hidden">
            <Sheet>
                <SheetTrigger asChild>
                    <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0 md:hidden"
                    >
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle navigation menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="flex flex-col">
                    <nav className="grid gap-6 text-lg font-medium">
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-2 text-lg font-semibold"
                        >
                            <Logo className="h-auto w-24" />
                            <span className="sr-only">ColGemelli</span>
                        </Link>
                        {navItems.map((item) => (
                           <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "transition-colors hover:text-foreground",
                                pathname === item.href ? "text-foreground" : "text-muted-foreground"
                            )}
                            >
                            {item.label}
                           </Link>
                        ))}
                    </nav>
                </SheetContent>
            </Sheet>
        </div>
        <Link href="/dashboard" className="hidden items-center gap-2 font-semibold md:flex">
          <Logo className="h-auto w-32" />
        </Link>
      </div>

      <div className="flex flex-1 items-center justify-end gap-4">
        <TopNav navItems={navItems} className="hidden md:flex" />
        {currentUser && (
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-9 w-9">
                    <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
                    <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                    {currentUser.username}
                    </p>
                </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>Cerrar Sesión</DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
        )}
      </div>
    </header>
  );
}
