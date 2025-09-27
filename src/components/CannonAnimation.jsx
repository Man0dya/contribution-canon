import React from 'react'
import { motion } from 'framer-motion'

const CannonAnimation = ({ contributionData, username, isUsingMockData = false }) => {

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
    <section className="py-6">
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
                ? "Showing demo contribution graph (no animation)"
                : "Real GitHub contribution graph (no animation)"
              }
            </p>
          </div>
          {/* Controls removed for static graph */}

          {/* Main animation area */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="bg-white border border-gray-200 rounded-lg shadow-sm p-12 relative overflow-hidden mx-auto"
            style={{ maxWidth: '1200px' }}
          >
            {/* Contribution grid (static) */}
            <div className="flex justify-center">
              <svg
                width={Math.min(contributionData.length * 16, 1100)}
                height={7 * 16}
                viewBox={`0 0 ${contributionData.length * 16} ${7 * 16}`}
                className="border border-gray-200 rounded-lg bg-gray-50"
              >
                {contributionData.map((week, weekIndex) => (
                  week.map((day, dayIndex) => (
                    <g key={`${weekIndex}-${dayIndex}`}>
                      <rect
                        x={weekIndex * 16 + 2}
                        y={dayIndex * 16 + 2}
                        width={12}
                        height={12}
                        rx={2}
                        fill={getContributionColor(day.level)}
                      />
                    </g>
                  ))
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