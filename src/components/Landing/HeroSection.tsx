"use client"
import React, { memo, useEffect, useMemo } from 'react'
import { motion, useScroll, useTransform, Variants } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { ChevronRight, Sparkles } from "lucide-react"
import Navbar from "@/components/Landing/Navbar"
import { badgeVariants, containerVariants, itemVariants, textVariants } from '@/lib/variants'

// Animation variants for better performance


const HeroSection = memo(() => {
  const { scrollY } = useScroll()
  
  // Parallax transformations
  const backgroundY = useTransform(scrollY, [0, 500], [0, -150])
  const patternY = useTransform(scrollY, [0, 500], [0, -100])
  const contentY = useTransform(scrollY, [0, 500], [0, 50])
  
  // Smooth scrolling setup
  useEffect(() => {
    const handleSmoothScroll = () => {
      document.documentElement.style.scrollBehavior = 'smooth'
    }
    
    handleSmoothScroll()
    
    return () => {
      document.documentElement.style.scrollBehavior = 'auto'
    }
  }, [])
  
  // Memoized background styles for performance
  const backgroundStyle = useMemo(() => ({
    backgroundImage: `url('/background.png')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    willChange: 'transform'
  }), [])
  
  const patternStyle = useMemo(() => ({
    backgroundImage: `url('/pattern.png')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    willChange: 'transform'
  }), [])

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background layers with parallax */}
      <motion.div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          ...backgroundStyle,
          y: backgroundY
        }}
      />

      <motion.div
        className="absolute inset-0 opacity-60"
        style={{
          ...patternStyle,
          y: patternY
        }}
      />

      <motion.div 
        className="relative z-10"
        style={{ y: contentY }}
      >
        <Navbar />

        <motion.div 
          className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Badge with animation */}
          <motion.div 
            className="flex items-center space-x-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 mb-12 backdrop-blur-sm"
            variants={badgeVariants}
            whileHover={{ 
              scale: 1.05,
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              transition: { duration: 0.2 }
            }}
          >
            <motion.div
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.2, 1]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                repeatType: "loop",
                ease: "easeInOut"
              }}
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
            </motion.div>
            <span className="text-white/80 text-sm font-medium">Your AI lab buddy for every coding adventure</span>
          </motion.div>

          {/* Main Heading with staggered animation */}
          <motion.h1 
            className="text-5xl md:text-7xl font-bold text-white mb-6 max-w-5xl leading-tight font-navbar"
            variants={itemVariants}
          >
            <motion.span
              variants={textVariants}
              className="inline-block"
            >
              just the friendly sidekick
            </motion.span>
            <br />
            <motion.span
              variants={textVariants}
              className="inline-block"
            >
              you need to build 
            </motion.span>
            <span 
              className="bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 bg-clip-text text-transparent"
            >
              {" "}crazy
            </span>
          </motion.h1>

          {/* Description with fade-in animation */}
          <motion.p 
            className="text-white/70 text-xl md:text-2xl mb-12 max-w-2xl leading-relaxed"
            variants={itemVariants}
          >
            Chat, automate, and analyze — 2alabs brings AI chat, automation and much more
          </motion.p>
          
          {/* Action buttons (uncommented and animated) */}
          <motion.div 
            className="flex items-center space-x-4"
            variants={itemVariants}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Button className="relative bg-white backdrop-blur-xl text-black border border-white/30 rounded-full px-8 py-3 text-lg font-medium transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-b before:from-white/40 before:to-transparent before:opacity-60 before:pointer-events-none overflow-hidden">
                <span className="relative z-10">Get started</span>
              </Button>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Button
                variant="ghost"
                className="text-white hover:bg-white/10 rounded-full px-8 py-3 text-lg font-medium border border-white/20 transition-all duration-300"
              >
                Try Demo
                <motion.div
                  className="ml-2"
                  animate={{ x: [0, 4, 0] }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "loop",
                    ease: "easeInOut"
                  }}
                >
                  <ChevronRight className="w-5 h-5" />
                </motion.div>
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
})

// Add display name for debugging
HeroSection.displayName = 'HeroSection'

export default HeroSection