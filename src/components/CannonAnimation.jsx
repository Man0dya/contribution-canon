import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, RotateCcw, Download } from 'lucide-react'

const CannonAnimation = ({ contributionData, username, isUsingMockData = false }) => {
  const [isPlaying, setIsPlaying] = useState(true)
  const [currentWeek, setCurrentWeek] = useState(0)
  const [destroyedCells, setDestroyedCells] = useState(new Set())
  const [animationSpeed, setAnimationSpeed] = useState(1)

  // Debug: Log contribution data
  useEffect(() => {
    if (contributionData) {
      const flatData = contributionData.flat()
      const totalContributions = flatData.reduce((sum, day) => sum + day.count, 0)
      const nonZeroDays = flatData.filter(day => day.count > 0)
      const levelDistribution = flatData.reduce((acc, day) => {
        acc[day.level] = (acc[day.level] || 0) + 1
        return acc
      }, {})
      
      console.log('🎬 CannonAnimation received data:', {
        username,
        isUsingMockData,
        dataLength: contributionData?.length,
        sampleWeek: contributionData?.[0],
        totalContributions,
        nonZeroDays: nonZeroDays.length,
        sampleContributions: nonZeroDays.slice(0, 3),
        levelDistribution
      })
    }
  }, [contributionData, username, isUsingMockData])

  // Reset animation when new data comes in
  useEffect(() => {
    setCurrentWeek(0)
    setDestroyedCells(new Set())
    setIsPlaying(true)
  }, [contributionData])

  // Animation loop
  useEffect(() => {
    if (!isPlaying || !contributionData) return

    const interval = setInterval(() => {
      setCurrentWeek(prev => {
        if (prev >= contributionData.length - 1) {
          // Animation complete, restart after delay
          setTimeout(() => {
            setCurrentWeek(0)
            setDestroyedCells(new Set())
          }, 2000)
          return prev
        }
        return prev + 1
      })
    }, 1000 / animationSpeed)

    return () => clearInterval(interval)
  }, [isPlaying, contributionData, animationSpeed])

  // Update destroyed cells when week changes
  useEffect(() => {
    if (!contributionData || currentWeek >= contributionData.length) return

    const weekData = contributionData[currentWeek]
    const newDestroyed = new Set(destroyedCells)
    
    weekData.forEach((day, dayIndex) => {
      if (day.count > 0) {
        newDestroyed.add(`${currentWeek}-${dayIndex}`)
      }
    })
    
    setDestroyedCells(newDestroyed)
  }, [currentWeek, contributionData])

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleRestart = () => {
    setCurrentWeek(0)
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
                  width: contributionData ? `${(currentWeek / contributionData.length) * 100}%` : '0%' 
                }}
                transition={{ duration: 0.3 }}
              />
            </div>

            <p className="text-gray-600 text-sm">
              Week {currentWeek + 1} of {contributionData?.length || 0} 
              | Contributions Destroyed: {destroyedCells.size}
              | Total Contributions: {contributionData?.flat().reduce((sum, day) => sum + day.count, 0) || 0}
            </p>
            {/* Debug info */}
            <div className="text-xs text-gray-400 mt-2">
              Data Type: {isUsingMockData ? 'Mock' : 'Real'} | 
              Weeks: {contributionData?.length || 0} | 
              Sample Day: {contributionData?.[0]?.[0] ? `${contributionData[0][0].date} (${contributionData[0][0].count} contributions)` : 'None'}
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
                animate={isPlaying && currentWeek < contributionData.length ? {
                  x: [0, -10, 0],
                  rotate: [0, -5, 0]
                } : {}}
                transition={{ duration: 0.5, repeat: 1 }}
                key={currentWeek}
              >
                <svg width="80" height="60" viewBox="0 0 80 60">
                  {/* Cannon base */}
                  <circle cx="20" cy="45" r="12" fill="url(#cannonGrad)" />
                  {/* Cannon barrel */}
                  <rect x="15" y="25" width="40" height="6" rx="3" fill="url(#cannonGrad)" />
                  {/* Cannon details */}
                  <circle cx="20" cy="45" r="8" fill="none" stroke="#444" strokeWidth="1" />
                  
                  <defs>
                    <linearGradient id="cannonGrad">
                      <stop offset="0%" stopColor="#4f46e5" />
                      <stop offset="100%" stopColor="#7c3aed" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Muzzle flash effect */}
                {isPlaying && currentWeek < contributionData.length && (
                  <motion.div
                    className="absolute right-0 top-1/2 transform -translate-y-1/2"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="w-6 h-6 bg-yellow-400 rounded-full blur-sm"></div>
                  </motion.div>
                )}
              </motion.div>
            </div>

            {/* Contribution grid */}
            <div className="ml-24 overflow-x-auto">
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
                    const isCurrentTarget = weekIndex === currentWeek && day.count > 0
                    
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
                          strokeWidth={2}
                          animate={isDestroyed ? {
                            scale: [1, 1.2, 0],
                            rotate: [0, 180, 360]
                          } : isCurrentTarget ? {
                            scale: [1, 1.1, 1]
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
                        )}

                        {/* Cannon ball trajectory */}
                        {isCurrentTarget && isPlaying && (
                          <motion.circle
                            cx={80}
                            cy={30}
                            r={2}
                            fill="#ff4444"
                            animate={{
                              cx: weekIndex * 12 + 6,
                              cy: dayIndex * 12 + 6
                            }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                          />
                        )}
                      </motion.g>
                    )
                  })
                ))}
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