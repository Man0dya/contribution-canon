import React from 'react'
import { motion } from 'framer-motion'
import { Target, Zap, Github } from 'lucide-react'

const Hero = () => {
  return (
        <section className="py-20 flex items-center justify-center relative overflow-hidden">
      <div className="container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          {/* Main heading */}
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
            <span className="text-blue-600">Contribution</span> Graph
          </h1>

          {/* Simple CTA Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-primary"
            onClick={() => {
              document.querySelector('#username-form')?.scrollIntoView({ 
                behavior: 'smooth' 
              })
            }}
          >
            Start Animation
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}

export default Hero