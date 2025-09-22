import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, RotateCcw, Download } from 'lucide-react'

const CannonAnimation = ({ contributionData, username, isUsingMockData = false }) => {
  const [isPlaying, setIsPlaying] = useState(true)
  const [currentTargetIndex, setCurrentTargetIndex] = useState(0)
  const [destroyedCells, setDestroyedCells] = useState(new Set())
  const [animationSpeed, setAnimationSpeed] = useState(1)
  const [contributionTargets, setContributionTargets] = useState([])

  // Create list of contribution targets (only cells with contributions)
  useEffect(() => {
    if (contributionData) {
      const targets = []
      contributionData.forEach((week, weekIndex) => {
        week.forEach((day, dayIndex) => {
          if (day.count > 0) {
            targets.push({
              weekIndex,
              dayIndex,
              count: day.count,
              level: day.level,
              cellKey: `${weekIndex}-${dayIndex}`
            })
          }
        })
      })
      
      setContributionTargets(targets)
      console.log('🎯 Found contribution targets:', {
        totalTargets: targets.length,
        totalCells: contributionData.flat().length,
        sampleTargets: targets.slice(0, 5)
      })
    }
  }, [contributionData])

  // Reset animation when new data comes in
  useEffect(() => {
    setCurrentTargetIndex(0)
    setDestroyedCells(new Set())
    setIsPlaying(true)
  }, [contributionData])

  // Animation loop - only shoot at contribution targets
  useEffect(() => {
    if (!isPlaying || contributionTargets.length === 0) return

    const interval = setInterval(() => {
      setCurrentTargetIndex(prev => {
        if (prev >= contributionTargets.length - 1) {
          // All targets destroyed, restart after delay
          setTimeout(() => {
            setCurrentTargetIndex(0)
            setDestroyedCells(new Set())
          }, 2000)
          return prev
        }
        return prev + 1
      })
    }, 1500 / animationSpeed) // Slower pace for better visibility

    return () => clearInterval(interval)
  }, [isPlaying, contributionTargets, animationSpeed])

  // Update destroyed cells when target changes
  useEffect(() => {
    if (contributionTargets.length === 0 || currentTargetIndex >= contributionTargets.length) return

    const currentTarget = contributionTargets[currentTargetIndex]
    if (currentTarget) {
      // Add delay before destroying to show the cannon ball animation
      setTimeout(() => {
        setDestroyedCells(prev => new Set([...prev, currentTarget.cellKey]))
      }, 800) // Match the cannon ball animation duration
    }
  }, [currentTargetIndex, contributionTargets])

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleRestart = () => {
    setCurrentTargetIndex(0)
    setDestroyedCells(new Set())
    setIsPlaying(true)
  }

  const getContributionColor = (level) => {
    const colors = {
      0: '#ebedf0', // No contributions - light gray
      1: '#9be9a8', // Low - light green
      2: '#40c463', // Medium-low - medium green
      3: '#30a14e', // Medium - darker green
      4: '#216e39'  // High - darkest green
    }
    return colors[level] || colors[0]
  }

  if (!contributionData) {
    return (
      <div className="w-full max-w-4xl mx-auto p-8 text-center">
        <div className="bg-gray-100 border border-gray-200 rounded-xl p-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">No Data Available</h3>
          <p className="text-gray-600">
            Enter a GitHub username above to fetch real contribution data for the cannon animation.
          </p>
        </div>
      </div>
    )
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          {/* Section header */}
          <div className="mb-8">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              🚀 {username}'s Contribution Cannon
              {isUsingMockData && <span className="text-orange-500 text-xl ml-2">(Demo Mode)</span>}
            </h2>
            <p className="text-xl text-gray-600">
              {isUsingMockData 
                ? "Showing demo animation with sample data"
                : "Watch the cannon blast through your GitHub contributions!"
              }
            </p>
          </div>

          {/* Animation controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-white border border-gray-200 shadow-sm p-6 rounded-2xl mb-8 max-w-4xl mx-auto"
          >
            <div className="flex flex-wrap justify-center items-center gap-4 mb-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePlayPause}
                className="btn-secondary flex items-center space-x-2"
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRestart}
                className="btn-secondary flex items-center space-x-2"
              >
                <RotateCcw size={20} />
                <span>Restart</span>
              </motion.button>

              <div className="flex items-center space-x-2">
                <span className="text-gray-600 text-sm">Speed:</span>
                <select
                  value={animationSpeed}
                  onChange={(e) => setAnimationSpeed(Number(e.target.value))}
                  className="bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={0.5}>0.5x</option>
                  <option value={1}>1x</option>
                  <option value={2}>2x</option>
                  <option value={3}>3x</option>
                </select>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <motion.div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ 
                  width: contributionTargets.length > 0 ? `${(currentTargetIndex / contributionTargets.length) * 100}%` : '0%' 
                }}
                transition={{ duration: 0.3 }}
              />
            </div>

            <p className="text-gray-600 text-sm">
              Target {currentTargetIndex + 1} of {contributionTargets.length} 
              | Contributions Destroyed: {destroyedCells.size}
              | Total Contribution Days: {contributionTargets.length}
            </p>
            {/* Debug info */}
            <div className="text-xs text-gray-400 mt-2">
              Data Type: {isUsingMockData ? 'Mock' : 'Real'} | 
              Weeks: {contributionData?.length || 0} | 
              Current Target: {contributionTargets[currentTargetIndex] ? 
                `Week ${contributionTargets[currentTargetIndex].weekIndex + 1}, Day ${contributionTargets[currentTargetIndex].dayIndex + 1} (${contributionTargets[currentTargetIndex].count} contributions)` 
                : 'None'}
            </div>
          </motion.div>

          {/* Main animation area */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="card max-w-6xl mx-auto p-8 relative overflow-hidden"
          >
            {/* Cannon */}
            <div className="absolute left-8 top-1/2 transform -translate-y-1/2 z-10">
              <motion.div
                animate={isPlaying && currentTargetIndex < contributionTargets.length ? {
                  x: [0, -10, 0],
                  rotate: [0, -5, 0]
                } : {}}
                transition={{ duration: 0.5, repeat: 1 }}
                key={currentTargetIndex}
              >
                <svg width="48" height="36" viewBox="0 0 48 36">
                  {/* Cannon platform */}
                  <rect x="2" y="28" width="20" height="6" rx="2" fill="url(#cannonBase)" />
                  {/* Cannon wheels */}
                  <circle cx="8" cy="32" r="3" fill="url(#wheelGrad)" stroke="#333" strokeWidth="0.5" />
                  <circle cx="16" cy="32" r="3" fill="url(#wheelGrad)" stroke="#333" strokeWidth="0.5" />
                  {/* Cannon body */}
                  <ellipse cx="12" cy="22" rx="8" ry="6" fill="url(#cannonGrad)" />
                  {/* Cannon barrel */}
                  <rect x="12" y="18" width="24" height="4" rx="2" fill="url(#barrelGrad)" />
                  {/* Cannon tip detail */}
                  <circle cx="36" cy="20" r="2.5" fill="url(#tipGrad)" stroke="#333" strokeWidth="0.5" />
                  <circle cx="36" cy="20" r="1.5" fill="#1a1a1a" />
                  
                  <defs>
                    <linearGradient id="cannonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#4f46e5" />
                      <stop offset="50%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#7c3aed" />
                    </linearGradient>
                    <linearGradient id="barrelGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#374151" />
                      <stop offset="50%" stopColor="#4b5563" />
                      <stop offset="100%" stopColor="#1f2937" />
                    </linearGradient>
                    <linearGradient id="cannonBase" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#6b7280" />
                      <stop offset="100%" stopColor="#374151" />
                    </linearGradient>
                    <linearGradient id="wheelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#9ca3af" />
                      <stop offset="100%" stopColor="#4b5563" />
                    </linearGradient>
                    <linearGradient id="tipGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#6b7280" />
                      <stop offset="100%" stopColor="#374151" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Muzzle flash effect from cannon tip */}
                {isPlaying && currentTargetIndex < contributionTargets.length && (
                  <motion.div
                    className="absolute"
                    style={{ left: '36px', top: '50%', transform: 'translateY(-50%)' }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="w-4 h-4 bg-yellow-400 rounded-full blur-sm"></div>
                    <div className="absolute inset-0 w-4 h-4 bg-orange-500 rounded-full blur-md opacity-60"></div>
                  </motion.div>
                )}
              </motion.div>
            </div>

            {/* Contribution grid */}
            <div className="ml-16 overflow-x-auto">
              <svg 
                width={contributionData.length * 12} 
                height={7 * 12} 
                viewBox={`0 0 ${contributionData.length * 12} ${7 * 12}`}
                className="border border-gray-200 rounded-lg bg-gray-50"
              >
                {contributionData.map((week, weekIndex) => (
                  week.map((day, dayIndex) => {
                    const cellKey = `${weekIndex}-${dayIndex}`
                    const isDestroyed = destroyedCells.has(cellKey)
                    const currentTarget = contributionTargets[currentTargetIndex]
                    const isCurrentTarget = currentTarget && 
                      currentTarget.weekIndex === weekIndex && 
                      currentTarget.dayIndex === dayIndex &&
                      !isDestroyed
                    
                    return (
                      <motion.g key={cellKey}>
                        {/* Contribution cell */}
                        <motion.rect
                          x={weekIndex * 12 + 1}
                          y={dayIndex * 12 + 1}
                          width={10}
                          height={10}
                          rx={2}
                          fill={isDestroyed ? '#ff4444' : getContributionColor(day.level)}
                          stroke={isCurrentTarget ? '#ffd700' : 'transparent'}
                          strokeWidth={isCurrentTarget ? 3 : 0}
                          animate={isDestroyed ? {
                            scale: [1, 1.2, 0]
                          } : isCurrentTarget ? {
                            scale: [1, 1.1, 1],
                            stroke: ['#ffd700', '#ff6b35', '#ffd700']
                          } : {}}
                          transition={isDestroyed ? {
                            duration: 0.6,
                            ease: "easeInOut"
                          } : {
                            duration: 0.5,
                            repeat: Infinity
                          }}
                        />

                        {/* Explosion effect */}
                        {isDestroyed && (
                          <motion.g>
                            <motion.circle
                              cx={weekIndex * 12 + 6}
                              cy={dayIndex * 12 + 6}
                              r={0}
                              fill="#ff6b35"
                              opacity={0.8}
                              animate={{
                                r: [0, 15, 25],
                                opacity: [0.8, 0.4, 0]
                              }}
                              transition={{ duration: 0.8 }}
                            />
                            {/* Explosion particles */}
                            {[...Array(6)].map((_, i) => (
                              <motion.circle
                                key={i}
                                cx={weekIndex * 12 + 6}
                                cy={dayIndex * 12 + 6}
                                r={1}
                                fill="#ffd700"
                                animate={{
                                  cx: weekIndex * 12 + 6 + Math.cos(i * Math.PI / 3) * 20,
                                  cy: dayIndex * 12 + 6 + Math.sin(i * Math.PI / 3) * 20,
                                  opacity: [1, 0]
                                }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                              />
                            ))}
                          </motion.g>
                        )}
                      </motion.g>
                    )
                  })
                ))}

                {/* Cannon ball trajectory from cannon tip */}
                {isPlaying && currentTargetIndex < contributionTargets.length && contributionTargets[currentTargetIndex] && (
                  <motion.g key={currentTargetIndex}>
                    {/* Bullet */}
                    <motion.circle
                      cx={60} // Start from cannon tip position
                      cy={20} // Cannon tip height
                      r={2}
                      fill="#ff4444"
                      stroke="#ff0000"
                      strokeWidth={0.5}
                      animate={{
                        cx: contributionTargets[currentTargetIndex].weekIndex * 12 + 6,
                        cy: contributionTargets[currentTargetIndex].dayIndex * 12 + 6
                      }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                    {/* Bullet trail */}
                    <motion.line
                      x1={60}
                      y1={20}
                      x2={60}
                      y2={20}
                      stroke="url(#trailGrad)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      animate={{
                        x2: contributionTargets[currentTargetIndex].weekIndex * 12 + 6,
                        y2: contributionTargets[currentTargetIndex].dayIndex * 12 + 6
                      }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      opacity={0.6}
                    />
                    
                    <defs>
                      <linearGradient id="trailGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#ff4444" stopOpacity="0" />
                        <stop offset="50%" stopColor="#ff6b35" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#ffd700" stopOpacity="1" />
                      </linearGradient>
                    </defs>
                  </motion.g>
                )}
              </svg>
            </div>

            {/* Legend */}
            <div className="mt-6 flex justify-center items-center space-x-4 text-sm">
              <span className="text-gray-600">Less</span>
              {[0, 1, 2, 3, 4].map(level => (
                <div
                  key={level}
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: getContributionColor(level) }}
                />
              ))}
              <span className="text-gray-600">More</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default CannonAnimation