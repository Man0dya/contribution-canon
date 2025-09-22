import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, Check, Download, Code, Palette, Settings } from 'lucide-react'

const CodeGenerator = ({ username, contributionData }) => {
  const [copied, setCopied] = useState(false)
  const [selectedTheme, setSelectedTheme] = useState('default')
  const [animationSpeed, setAnimationSpeed] = useState('normal')
  const [size, setSize] = useState('medium')

  const themes = {
    default: {
      name: 'Default',
      cannon: '#4f46e5',
      explosion: '#ff6b35',
      background: '#ffffff'
    },
    github: {
      name: 'GitHub',
      cannon: '#216e39',
      explosion: '#ff4444',
      background: '#f6f8fa'
    },
    ocean: {
      name: 'Ocean',
      cannon: '#0ea5e9',
      explosion: '#f97316',
      background: '#f0f9ff'
    },
    sunset: {
      name: 'Sunset',
      cannon: '#dc2626',
      explosion: '#fbbf24',
      background: '#fef3c7'
    }
  }

  const sizes = {
    small: { width: 600, height: 150 },
    medium: { width: 800, height: 200 },
    large: { width: 1000, height: 250 }
  }

  const generateSvgCode = () => {
    if (!contributionData || contributionData.length === 0) {
      return `<svg width="800" height="200" xmlns="http://www.w3.org/2000/svg">
        <text x="400" y="100" text-anchor="middle" fill="#666">No contribution data available</text>
      </svg>`
    }

    const theme = themes[selectedTheme]
    const sizeConfig = sizes[size]
    
    // Calculate grid dimensions based on real data
    const weeks = contributionData.length
    const days = 7
    const cellSize = 11
    const gridWidth = weeks * cellSize
    const gridHeight = days * cellSize
    
    // Get only cells with contributions for animation
    const contributionCells = []
    contributionData.forEach((week, weekIndex) => {
      week.forEach((day, dayIndex) => {
        if (day.count > 0) {
          contributionCells.push({
            weekIndex,
            dayIndex,
            count: day.count,
            level: day.level,
            x: weekIndex * cellSize + 1,
            y: dayIndex * cellSize + 1
          })
        }
      })
    })

    const animationDuration = contributionCells.length * 0.8 // 0.8s per cell
    const speedMultiplier = animationSpeed === 'fast' ? 0.5 : animationSpeed === 'slow' ? 2 : 1
    const totalDuration = animationDuration * speedMultiplier

    return `<svg width="${sizeConfig.width}" height="${sizeConfig.height}" viewBox="0 0 ${sizeConfig.width} ${sizeConfig.height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .contribution-grid { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
      .contribution-cell { 
        animation: pop-animation ${totalDuration}s infinite linear;
        transform-origin: center;
      }
      
      @keyframes pop-animation {
        0%, 90% { transform: scale(1); opacity: 1; }
        2% { transform: scale(1.3) rotate(15deg); opacity: 0.8; }
        4% { transform: scale(0.8) rotate(-10deg); opacity: 0.6; }
        6% { transform: scale(1.1) rotate(5deg); opacity: 0.4; }
        8% { transform: scale(0); opacity: 0; }
        10%, 100% { transform: scale(1); opacity: 1; }
      }
    </style>
  </defs>
  
  <!-- Background -->
  <rect width="100%" height="100%" fill="${theme.background}" rx="6"/>
  
  <!-- Title -->
  <text x="20" y="30" font-family="sans-serif" font-size="16" font-weight="bold" fill="#333">
    ${username}'s Contribution Animation
  </text>
  
  <!-- Contribution Grid -->
  <g class="contribution-grid" transform="translate(20, 50)">
    ${generateRealContributionGrid(contributionData, theme, contributionCells, totalDuration)}
  </g>
  
  <!-- Legend -->
  <g transform="translate(20, ${sizeConfig.height - 30})">
    <text x="0" y="0" font-family="sans-serif" font-size="12" fill="#666">Less</text>
    ${[0, 1, 2, 3, 4].map(level => 
      `<rect x="${40 + level * 15}" y="-10" width="10" height="10" rx="2" fill="${getContributionColorForLevel(level)}"/>`
    ).join('')}
    <text x="${40 + 5 * 15}" y="0" font-family="sans-serif" font-size="12" fill="#666">More</text>
  </g>
</svg>`
  }

  const getContributionColorForLevel = (level) => {
    const colors = {
      0: '#ebedf0', // No contributions
      1: '#9be9a8', // Low
      2: '#40c463', // Medium-low  
      3: '#30a14e', // Medium-high
      4: '#216e39'  // High
    }
    return colors[level] || colors[0]
  }

  const generateRealContributionGrid = (data, theme, contributionCells, totalDuration) => {
    if (!data || data.length === 0) return ''
    
    let grid = ''
    const cellSize = 11
    
    // Generate all cells (background grid)
    data.forEach((week, weekIndex) => {
      week.forEach((day, dayIndex) => {
        const x = weekIndex * cellSize + 1
        const y = dayIndex * cellSize + 1
        const color = getContributionColorForLevel(day.level)
        
        grid += `<rect x="${x}" y="${y}" width="9" height="9" rx="2" fill="${color}"/>
        `
      })
    })
    
    // Generate animated cells (only for contributions > 0)
    contributionCells.forEach((cell, index) => {
      const animationDelay = (index * 0.8) % totalDuration // Stagger animations
      
      grid += `<rect class="contribution-cell" 
        x="${cell.x}" y="${cell.y}" 
        width="9" height="9" rx="2" 
        fill="${getContributionColorForLevel(cell.level)}"
        style="animation-delay: ${animationDelay}s;">
        
        <!-- Explosion effect -->
        <animate attributeName="fill" 
          values="${getContributionColorForLevel(cell.level)};#ff6b35;#ffd700;${getContributionColorForLevel(cell.level)}" 
          dur="${totalDuration}s" 
          begin="${animationDelay}s"
          repeatCount="indefinite"/>
      </rect>
      `
      
      // Add explosion particles
      for (let i = 0; i < 4; i++) {
        const angle = (i * 90) * (Math.PI / 180)
        const radius = 8
        const particleX = cell.x + 4.5 + Math.cos(angle) * radius
        const particleY = cell.y + 4.5 + Math.sin(angle) * radius
        
        grid += `<circle cx="${cell.x + 4.5}" cy="${cell.y + 4.5}" r="1" fill="#ffd700" opacity="0">
          <animate attributeName="cx" 
            values="${cell.x + 4.5};${particleX};${cell.x + 4.5}" 
            dur="${totalDuration}s" 
            begin="${animationDelay}s"
            repeatCount="indefinite"/>
          <animate attributeName="cy" 
            values="${cell.y + 4.5};${particleY};${cell.y + 4.5}" 
            dur="${totalDuration}s" 
            begin="${animationDelay}s"
            repeatCount="indefinite"/>
          <animate attributeName="opacity" 
            values="0;0;1;0.5;0" 
            dur="${totalDuration}s" 
            begin="${animationDelay}s"
            repeatCount="indefinite"/>
        </circle>
        `
      }
    })
    
    return grid
  }

  const generateMarkdownCode = () => {
    const fileName = `${username}-contribution-animation.svg`
    
    return `![${username}'s Contribution Animation](${fileName})

<!-- 
Steps to add to your README:
1. Click "Download SVG" above
2. Save the file as "${fileName}" in your repository root
3. Commit and push the SVG file to your repo
4. The animation will display in your README!
-->`
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateMarkdownCode())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const downloadSvg = () => {
    const svgContent = generateSvgCode()
    const blob = new Blob([svgContent], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = `${username}-contribution-animation.svg`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <section className="py-6">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto"
        >
          {/* Section header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
              🎨 Customize & Export
            </h2>
            <p className="text-lg text-gray-600">
              Get your animated SVG for README
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Customization Panel */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="card space-y-6 min-h-[600px]"
            >
              <div className="flex items-center space-x-3 mb-6">
                <Settings className="w-6 h-6 text-blue-500" />
                <h3 className="text-2xl font-bold text-gray-800">Customization</h3>
              </div>

              {/* Theme Selection */}
              <div className="space-y-3">
                <label className="block text-gray-700 font-medium">
                  <Palette className="w-4 h-4 inline mr-2" />
                  Theme
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(themes).map(([key, theme]) => (
                    <motion.button
                      key={key}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedTheme(key)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedTheme === key
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: theme.cannon }}
                        />
                        <span className="text-gray-700 text-sm">{theme.name}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              <div className="space-y-3">
                <label className="block text-gray-700 font-medium">Size</label>
                <select
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className="input-field w-full"
                >
                  <option value="small">Small (600×150)</option>
                  <option value="medium">Medium (800×200)</option>
                  <option value="large">Large (1000×250)</option>
                </select>
              </div>

              {/* Animation Speed */}
              <div className="space-y-3">
                <label className="block text-gray-700 font-medium">Animation Speed</label>
                <select
                  value={animationSpeed}
                  onChange={(e) => setAnimationSpeed(e.target.value)}
                  className="input-field w-full"
                >
                  <option value="slow">Slow</option>
                  <option value="normal">Normal</option>
                  <option value="fast">Fast</option>
                </select>
              </div>

              {/* Download SVG Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={downloadSvg}
                className="w-full btn-secondary flex items-center justify-center space-x-2"
              >
                <Download className="w-5 h-5" />
                <span>Download SVG</span>
              </motion.button>
            </motion.div>

            {/* Code Output Panel */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="card space-y-6 min-h-[600px]"
            >
              <div className="flex items-center space-x-3 mb-6">
                <Code className="w-6 h-6 text-green-500" />
                <h3 className="text-2xl font-bold text-gray-800">README Code</h3>
              </div>

              {/* Code display */}
              <div className="space-y-4">
                <div className="bg-gray-900 rounded-lg p-4 relative">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-400 text-sm font-mono">Markdown</span>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleCopy}
                      className="flex items-center space-x-2 px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded text-sm transition-colors"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 text-green-400" />
                          <span className="text-green-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copy</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                  <code className="text-green-400 font-mono text-sm break-all">
                    {generateMarkdownCode()}
                  </code>
                </div>

                {/* Instructions */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="text-green-700 font-semibold mb-2">📝 How to embed in your README:</h4>
                  <ol className="text-gray-700 text-sm space-y-2 list-decimal list-inside">
                    <li>Click <strong>"Download SVG"</strong> above to get your animated file</li>
                    <li>Save it as <code className="bg-gray-100 px-1 rounded text-xs">{username}-contribution-animation.svg</code> in your repository root</li>
                    <li>Copy the markdown code above and paste it in your README.md</li>
                    <li>Commit and push both files to your repository</li>
                    <li>🎉 Your animated contribution graph will appear in your README!</li>
                  </ol>
                  
                  <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                    <strong>💡 Tip:</strong> The SVG contains real animation with your actual contribution data, just like the snake animation!
                  </div>
                </div>


              </div>
            </motion.div>
          </div>


        </motion.div>
      </div>
    </section>
  )
}

export default CodeGenerator