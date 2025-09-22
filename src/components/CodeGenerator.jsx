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
    const theme = themes[selectedTheme]
    const sizeConfig = sizes[size]
    
    return `<svg width="${sizeConfig.width}" height="${sizeConfig.height}" viewBox="0 0 ${sizeConfig.width} ${sizeConfig.height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="cannonGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:${theme.cannon};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${theme.cannon}88;stop-opacity:1" />
    </linearGradient>
    <style>
      .contribution-cell { animation: cannon-blast 3s infinite; }
      .cannon { animation: cannon-recoil 3s infinite; }
      .projectile { animation: projectile-flight 3s infinite; }
      
      @keyframes cannon-blast {
        0%, 90% { transform: translateX(0) rotate(0deg); }
        5% { transform: translateX(-8px) rotate(-3deg); }
        10% { transform: translateX(0) rotate(0deg); }
      }
      
      @keyframes projectile-flight {
        0%, 90% { opacity: 0; transform: translateX(0) translateY(0) scale(1); }
        5% { opacity: 1; }
        15% { opacity: 1; transform: translateX(${sizeConfig.width * 0.8}px) translateY(-20px) scale(0.8); }
        20% { opacity: 0; transform: translateX(${sizeConfig.width * 0.9}px) translateY(-10px) scale(0); }
      }
      
      @keyframes cannon-blast {
        0% { transform: scale(1) rotate(0deg); opacity: 1; }
        15% { transform: scale(1.2) rotate(180deg); opacity: 0.8; }
        20% { transform: scale(0) rotate(360deg); opacity: 0; }
        21%, 100% { transform: scale(1) rotate(0deg); opacity: 1; }
      }
    </style>
  </defs>
  
  <!-- Background -->
  <rect width="100%" height="100%" fill="${theme.background}"/>
  
  <!-- Cannon -->
  <g class="cannon">
    <circle cx="40" cy="${sizeConfig.height/2}" r="20" fill="url(#cannonGrad)"/>
    <rect x="35" y="${sizeConfig.height/2 - 8}" width="60" height="16" rx="8" fill="url(#cannonGrad)"/>
    <circle cx="40" cy="${sizeConfig.height/2}" r="15" fill="none" stroke="${theme.cannon}44" stroke-width="2"/>
  </g>
  
  <!-- Projectile -->
  <circle class="projectile" cx="95" cy="${sizeConfig.height/2}" r="4" fill="${theme.explosion}"/>
  
  <!-- Contribution Grid (Simplified) -->
  <g transform="translate(150, ${sizeConfig.height/2 - 42})">
    ${generateContributionGrid(theme)}
  </g>
  
  <!-- Muzzle Flash -->
  <circle cx="95" cy="${sizeConfig.height/2}" r="12" fill="${theme.explosion}" opacity="0.6">
    <animate attributeName="opacity" values="0;0.8;0" dur="3s" repeatCount="indefinite"/>
    <animate attributeName="r" values="0;20;0" dur="3s" repeatCount="indefinite"/>
  </circle>
</svg>`
  }

  const generateContributionGrid = (theme) => {
    let grid = ''
    const weeks = 53
    const days = 7
    
    for (let week = 0; week < weeks; week++) {
      for (let day = 0; day < days; day++) {
        const level = Math.floor(Math.random() * 5)
        const colors = ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353']
        
        grid += `<rect class="contribution-cell" x="${week * 12}" y="${day * 12}" width="10" height="10" rx="2" fill="${colors[level]}" style="animation-delay: ${(week * 0.1)}s;"/>
        `
      }
    }
    
    return grid
  }

  const generateMarkdownCode = () => {
    // Since this is a client-side app without API endpoints, provide a link to the live site
    const baseUrl = 'https://man0dya.github.io/contribution-canon/'
    const params = new URLSearchParams({
      username,
      theme: selectedTheme,
      speed: animationSpeed,
      size
    })
    
    // Provide both a link and instructions for embedding
    return `[![${username}'s Contribution Canon](https://img.shields.io/badge/🎯_Contribution_Canon-View_Animation-brightgreen?style=for-the-badge)](${baseUrl}?${params.toString()})

<!-- For a static preview, download the SVG above and commit it to your repo, then reference it like: -->
<!-- ![Contribution Animation](./path-to-your-downloaded-svg.svg) -->`
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
    a.download = `${username}-contribution-cannon.svg`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto"
        >
          {/* Section header */}
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              🎨 Customize & Export
            </h2>
            <p className="text-xl text-gray-600">
              Personalize your cannon and get the code for your README
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Customization Panel */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="card space-y-6"
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
              className="card space-y-6"
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
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-blue-700 font-semibold mb-2">📝 How to use:</h4>
                  <div className="space-y-3">
                    <div>
                      <h5 className="font-medium text-gray-800">Option 1: Badge Link (Recommended)</h5>
                      <ol className="text-gray-700 text-sm space-y-1 list-decimal list-inside ml-2">
                        <li>Copy the markdown code above</li>
                        <li>Paste it into your GitHub README.md file</li>
                        <li>This creates a clickable badge that links to your animation</li>
                      </ol>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-800">Option 2: Static SVG</h5>
                      <ol className="text-gray-700 text-sm space-y-1 list-decimal list-inside ml-2">
                        <li>Click "Download SVG" above</li>
                        <li>Add the SVG file to your repository</li>
                        <li>Reference it in your README: <code className="text-xs bg-gray-100 px-1 rounded">![Animation](./your-file.svg)</code></li>
                      </ol>
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-gray-800 font-semibold mb-3">Preview:</h4>
                  <div 
                    className="w-full h-32 rounded border border-gray-200 flex items-center justify-center"
                    style={{ 
                      backgroundColor: themes[selectedTheme].background || '#f8f9fa',
                      backgroundImage: `linear-gradient(45deg, ${themes[selectedTheme].cannon}22 25%, transparent 25%), linear-gradient(-45deg, ${themes[selectedTheme].cannon}22 25%, transparent 25%)`
                    }}
                  >
                    <span className="text-gray-600 text-sm">
                      {username}'s Contribution Cannon Preview
                    </span>
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