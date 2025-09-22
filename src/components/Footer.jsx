import React from 'react'
import { motion } from 'framer-motion'
import { Github, Heart, Star, Coffee } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="py-8 border-t border-gray-200 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center space-y-6"
        >
          {/* Main footer content */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h3 className="text-3xl font-bold text-gradient mb-2">
                Contribution Canon
              </h3>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Transform your GitHub contribution graph into epic cannon animations. 
                Open source, free forever, and built with love for the developer community.
              </p>
            </motion.div>

            {/* Action buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="flex flex-wrap justify-center gap-4"
            >
              <motion.a
                href="https://github.com/Man0dya/contribution-canon"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-secondary flex items-center space-x-2"
              >
                <Github className="w-5 h-5" />
                <span>View on GitHub</span>
              </motion.a>

              <motion.a
                href="https://github.com/Man0dya/contribution-canon"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-secondary flex items-center space-x-2"
              >
                <Star className="w-5 h-5" />
                <span>Star this Project</span>
              </motion.a>

              <motion.a
                href="https://buymeacoffee.com/Man0dya"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary flex items-center space-x-2"
              >
                <Coffee className="w-5 h-5" />
                <span>Buy me a coffee</span>
              </motion.a>
            </motion.div>

            {/* Features grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
            >
              <div className="bg-white border border-gray-200 shadow-sm p-6 rounded-xl">
                <div className="text-2xl mb-3">⚡</div>
                <h4 className="font-semibold text-gray-800 mb-2">Precise Animations</h4>
                <p className="text-gray-600 text-sm">
                  Every shot targets your actual contribution data with pixel-perfect accuracy
                </p>
              </div>

              <div className="bg-white border border-gray-200 shadow-sm p-6 rounded-xl">
                <div className="text-2xl mb-3">⚡</div>
                <h4 className="font-semibold text-gray-800 mb-2">Lightning Fast</h4>
                <p className="text-gray-600 text-sm">
                  Optimized SVG animations that load instantly and run smoothly on any device
                </p>
              </div>

              <div className="bg-white border border-gray-200 shadow-sm p-6 rounded-xl">
                <div className="text-2xl mb-3">🎨</div>
                <h4 className="font-semibold text-gray-800 mb-2">Fully Customizable</h4>
                <p className="text-gray-600 text-sm">
                  Multiple themes, sizes, and animation speeds to match your style perfectly
                </p>
              </div>
            </motion.div>
          </div>

          {/* Bottom section */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            viewport={{ once: true }}
            className="pt-8 border-t border-gray-200 space-y-4"
          >


            <div className="flex flex-wrap justify-center items-center gap-6 text-gray-500 text-sm">
              <span>© 2025 Contribution Canon</span>
              <span>•</span>
              <a 
                href="https://github.com/Man0dya/contribution-canon/blob/main/LICENSE" 
                className="hover:text-gray-800 transition-colors"
              >
                MIT License
              </a>
              <span>•</span>
              <a 
                href="https://github.com/Man0dya/contribution-canon/issues" 
                className="hover:text-gray-800 transition-colors"
              >
                Report Issues
              </a>
              <span>•</span>
              <a 
                href="https://github.com/Man0dya/contribution-canon/discussions/1" 
                className="hover:text-gray-800 transition-colors"
              >
                Discussions
              </a>
            </div>

            {/* Tech stack */}
            <div className="text-gray-400 text-xs">
              <p>Built with React, Vite, Tailwind CSS, and Framer Motion</p>
            </div>

            {/* Fun stats */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
              viewport={{ once: true }}
              className="flex justify-center items-center space-x-8 text-gray-400 text-xs"
            >
              <div className="flex items-center space-x-1">
                <span>🚀</span>
                <span>Cannons Fired: 1,337</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>💥</span>
                <span>Contributions Blasted: 42,069</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>👥</span>
                <span>Happy Developers: 100+</span>
              </div>
            </motion.div>
          </motion.div>


        </motion.div>
      </div>
    </footer>
  )
}

export default Footer