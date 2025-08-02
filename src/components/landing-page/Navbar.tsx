"use client"

import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useState, memo } from "react"
import { useTheme } from 'next-themes'
import { motion } from 'framer-motion'

// Animation variants
const navbarVariants = {
  hidden: { 
    opacity: 0, 
    y: -20 
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

const itemVariants = {
  hidden: { 
    opacity: 0, 
    y: -10,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4
    }
  }
}

const logoVariants = {
  hidden: { 
    opacity: 0, 
    x: -20,
    rotate: -10
  },
  visible: {
    opacity: 1,
    x: 0,
    rotate: 0,
    transition: {
      duration: 0.6
    }
  }
}

const buttonVariants = {
  hidden: { 
    opacity: 0, 
    x: 20,
    scale: 0.9
  },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.5
    }
  }
}

const Navbar = memo(() => {
  const [activeItem] = useState("Home")
  const navItems = ["Home", "Resources", "Cases", "FAQ", "Pricing"]
  const { theme, setTheme } = useTheme()

  return (
    <motion.nav 
      className="flex items-center justify-between px-6 py-6 max-w-7xl mx-auto"
      variants={navbarVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Logo */}
      <motion.div 
        className="flex items-center space-x-2"
        variants={logoVariants}
      >
        <motion.div
          whileHover={{ 
            scale: 1.05,
            rotate: 5,
            transition: { duration: 0.2 }
          }}
          whileTap={{ scale: 0.95 }}
        >
          <Image 
            src="/2alabs.png" 
            alt="Logo" 
            width={100} 
            height={100}
            className="cursor-pointer"
            priority
          />
        </motion.div>
      </motion.div>

      {/* Center Navigation Pills */}
      <motion.div 
        className="hidden md:flex items-center bg-black/40 backdrop-blur-xl border border-white/10 rounded-full px-2 py-2"
        variants={itemVariants}
      >
        {navItems.map((item, index) => (
          <motion.button
            key={item}
            onClick={() => setTheme(`${theme === 'dark' ? 'light' : 'dark'}`)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              activeItem === item
                ? "bg-white/20 text-white shadow-lg"
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
            variants={{
              hidden: { opacity: 0, y: -10 },
              visible: { 
                opacity: 1, 
                y: 0,
                transition: {
                  delay: index * 0.1,
                  duration: 0.3
                }
              }
            }}
            whileHover={{ 
              scale: 1.05,
              y: -2,
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.95 }}
          >
            {item}
          </motion.button>
        ))}
      </motion.div>

      {/* Right Side Actions */}
      <motion.div 
        className="flex items-center space-x-4"
        variants={buttonVariants}
      >
        <motion.a 
          href="#" 
          className="text-white/70 hover:text-white transition-colors"
          whileHover={{ 
            scale: 1.05,
            color: "rgba(255, 255, 255, 1)",
            transition: { duration: 0.2 }
          }}
        >
          Log in
        </motion.a>
        
        <motion.div
          whileHover={{ 
            scale: 1.05,
            transition: { duration: 0.2 }
          }}
          whileTap={{ scale: 0.95 }}
        >
          <Button className="relative bg-gradient-to-b from-[#783AB5] via-black to-[#4B2476] text-white rounded-full px-6 py-2 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-b before:from-white/20 before:to-transparent before:opacity-80 before:pointer-events-none overflow-hidden">
            <motion.span 
              className="relative z-10"
              whileHover={{
                scale: 1.02,
                transition: { duration: 0.2 }
              }}
            >
              Get Started
            </motion.span>
          </Button>
        </motion.div>
      </motion.div>
    </motion.nav>
  )
})

Navbar.displayName = 'Navbar'

export default Navbar