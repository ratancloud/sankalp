"use client"

import * as React from "react"
import { Moon, Sun, Laptop } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ModeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full h-9 w-9 bg-background/50 border border-transparent hover:bg-muted hover:border-border/50 transition-all"
        >
          {/* Sun Icon: Visible in Light Mode, rotates out in Dark */}
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          
          {/* Moon Icon: Hidden in Light Mode, rotates in for Dark */}
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="rounded-xl min-w-37.5">
        <DropdownMenuItem 
          onClick={() => setTheme("light")}
          className={`rounded-lg cursor-pointer flex items-center gap-2 ${theme === 'light' ? 'bg-primary/10 text-primary font-medium' : ''}`}
        >
          <Sun className="h-4 w-4" /> 
          <span>Light</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => setTheme("dark")}
          className={`rounded-lg cursor-pointer flex items-center gap-2 ${theme === 'dark' ? 'bg-primary/10 text-primary font-medium' : ''}`}
        >
          <Moon className="h-4 w-4" /> 
          <span>Dark</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => setTheme("system")}
          className={`rounded-lg cursor-pointer flex items-center gap-2 ${theme === 'system' ? 'bg-primary/10 text-primary font-medium' : ''}`}
        >
          <Laptop className="h-4 w-4" /> 
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}