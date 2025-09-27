import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, Check, Download, Code, Palette, Settings } from 'lucide-react'

const CodeGenerator = ({ username, contributionData }) => {
  const [copied, setCopied] = useState(false)
  const [selectedTheme, setSelectedTheme] = useState('default')
  const [animationSpeed, setAnimationSpeed] = useState('normal')
  const [noContributionColor, setNoContributionColor] = useState('#ebedf0')
  const [hideZeroDays, setHideZeroDays] = useState(false)

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

  // Default viewBox for exported/previewed SVG; width attribute is 100% to match README width
  const defaultViewBox = { width: 1200, height: 340 }

  const generateSvgCode = () => {
    // Bubble Shooter style SVG generator: green (contributed) cells are targets.
    if (!contributionData || contributionData.length === 0) {
      return `<svg width="800" height="220" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f6f8fa"/>
        <text x="400" y="110" text-anchor="middle" fill="#666" font-family="sans-serif" font-size="14">No contribution data available</text>
      </svg>`
    }

    const theme = themes[selectedTheme]
    // Map speed to duration scale (lower = faster)
    const speedMul = animationSpeed === 'fast' ? 0.6 : animationSpeed === 'slow' ? 1.6 : 1

    return buildBubbleShooterSVG({
      username,
      data: contributionData,
      width: defaultViewBox.width,
      height: defaultViewBox.height,
      theme,
      speedMul
    })
  }

  const getContributionColorForLevel = (level) => {
    const colors = {
      0: noContributionColor, // No contributions (customizable)
      1: '#9be9a8', // Low
      2: '#40c463', // Medium-low  
      3: '#30a14e', // Medium-high
      4: '#216e39'  // High
    }
    return colors[level] || colors[0]
  }

  // Build Bubble Shooter style SVG string using SMIL animations
  const buildBubbleShooterSVG = ({ username, data, width, height, theme, speedMul }) => {
    const margin = { left: 20, top: 40, right: 20, bottom: 30 }
    const weeks = data.length
    const days = 7
    // Revert bubble sizing cap
    const cell = Math.max(10, Math.min(14, Math.floor((width - margin.left - margin.right) / Math.max(30, weeks))))
    const radius = Math.floor(cell * 0.45)
    const gridW = weeks * cell
    const gridH = days * cell
    const originX = margin.left + (width - margin.left - margin.right - gridW) / 2
    const originY = margin.top

    const shooterX = originX + gridW / 2
    const shooterY = originY + gridH + 26

    // Build list of bubbles with positions (centers)
    const bubbles = []
    data.forEach((week, wi) => {
      week.forEach((day, di) => {
        const cx = originX + wi * cell + cell / 2
        const cy = originY + di * cell + cell / 2
        const isGreen = day.count > 0
        bubbles.push({ cx, cy, level: day.level, isGreen })
      })
    })

    // Targets are only green bubbles (contribution days)
    const targets = bubbles.filter(b => b.isGreen)
    // Safety cap to avoid huge files
    const MAX_TARGETS = 220
    const prunedTargets = targets.slice(0, MAX_TARGETS)

    // Timings (apply speed scale directly so fast -> shorter, slow -> longer)
    const tShot = 0.6 * speedMul
    const tGap = 0.25 * speedMul
    const total = prunedTargets.length > 0 ? prunedTargets.length * (tShot + tGap) + 0.5 : 2

    // Map targets to their shot index to drive per-bubble animations
    const shotIndexByPos = new Map()
    prunedTargets.forEach((t, i) => {
      shotIndexByPos.set(`${t.cx},${t.cy}`, i)
    })

    // Grid bubbles: include all days unless hidden; embed pop + color-change animations per bubble
    let gridStr = ''
    bubbles.forEach((b, idx) => {
      if (hideZeroDays && !b.isGreen) return
      const fill = getContributionColorForLevel(b.level)
      const gid = `bubble-${idx}`
      const cid = `bubble-${idx}-c`
      const key = `${b.cx},${b.cy}`
      const shotIndex = shotIndexByPos.get(key)

      let anims = `\n          <set attributeName=\"opacity\" to=\"1\" begin=\"cycle.begin\"/>\n          <set attributeName=\"r\" to=\"${radius}\" begin=\"cycle.begin\"/>\n          <set attributeName=\"fill\" to=\"${fill}\" begin=\"cycle.begin\"/>`
      if (shotIndex !== undefined) {
        const popUp = (radius * 1.35).toFixed(2)
        // Pop bounce
        anims += `\n          <animate attributeName=\"r\" from=\"${radius}\" to=\"${popUp}\" begin=\"shot-${shotIndex}.end\" dur=\"0.12s\" fill=\"freeze\"/>\n          <animate attributeName=\"r\" from=\"${popUp}\" to=\"${radius}\" begin=\"shot-${shotIndex}.end+0.12s\" dur=\"0.12s\" fill=\"freeze\"/>\n          <animate attributeName=\"opacity\" from=\"1\" to=\"0\" begin=\"shot-${shotIndex}.end+0.12s\" dur=\"0.06s\" fill=\"freeze\"/>\n          <set attributeName=\"fill\" to=\"${noContributionColor}\" begin=\"shot-${shotIndex}.end+0.19s\"/>\n          <animate attributeName=\"opacity\" from=\"0\" to=\"1\" begin=\"shot-${shotIndex}.end+0.22s\" dur=\"0.08s\" fill=\"freeze\"/>`
      }

      gridStr += `\n      <g id=\"${gid}\">\n        <circle id=\"${cid}\" cx=\"${b.cx}\" cy=\"${b.cy}\" r=\"${radius}\" fill=\"${fill}\" opacity=\"1\">${anims}\n        </circle>\n      </g>`
    })

    // Bullets and pops
    let bulletsStr = ''
    let popsStr = ''
    prunedTargets.forEach((t, i) => {
      const begin = (i * (tShot + tGap)).toFixed(3)
      const shotId = `shot-${i}`
  bulletsStr += `\n      <circle cx="${shooterX}" cy="${shooterY}" r="3.5" fill="${theme.cannon}" opacity="0">\n        <set attributeName="opacity" to="1" begin="cycle.begin+${begin}s"/>\n        <animate id="${shotId}" attributeName="cy" from="${shooterY}" to="${t.cy}" begin="cycle.begin+${begin}s" dur="${tShot}s" fill="freeze"/>\n        <animate attributeName="cx" from="${shooterX}" to="${t.cx}" begin="cycle.begin+${begin}s" dur="${tShot}s" fill="freeze"/>\n        <set attributeName="opacity" to="0" begin="${shotId}.end"/>\n      </circle>`

  // Identify target (kept for reference; color change handled inside bubble via shot index mapping)

      // Explosion ring
      popsStr += `\n      <circle cx="${t.cx}" cy="${t.cy}" r="${radius}" fill="none" stroke="${theme.explosion}" stroke-width="2" opacity="0">\n        <set attributeName="opacity" to="1" begin="${shotId}.end"/>\n        <animate attributeName="r" from="${radius}" to="${(radius * 1.8).toFixed(2)}" begin="${shotId}.end" dur="0.35s" fill="freeze"/>\n        <animate attributeName="opacity" from="1" to="0" begin="${shotId}.end" dur="0.35s" fill="freeze"/>\n      </circle>`

      // Particles
      for (let pi = 0; pi < 6; pi++) {
        const ang = (pi * Math.PI) / 3
        const px = (t.cx + Math.cos(ang) * (radius * 1.6)).toFixed(2)
        const py = (t.cy + Math.sin(ang) * (radius * 1.6)).toFixed(2)
        popsStr += `\n      <circle cx="${t.cx}" cy="${t.cy}" r="1.6" fill="#ffd700" opacity="1">\n        <animate attributeName="cx" from="${t.cx}" to="${px}" begin="${shotId}.end" dur="0.35s" fill="freeze"/>\n        <animate attributeName="cy" from="${t.cy}" to="${py}" begin="${shotId}.end" dur="0.35s" fill="freeze"/>\n        <animate attributeName="opacity" from="1" to="0" begin="${shotId}.end" dur="0.35s" fill="freeze"/>\n      </circle>`
      }
    })

    // Build final SVG (legend removed)
    return `<?xml version="1.0" encoding="UTF-8"?>\n<svg width="100%" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">\n  <defs>\n    <style>\n      .title { font: 600 16px/1.2 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Ubuntu,Cantarell,'Noto Sans',sans-serif; fill: #111; }\n      .meta { font: 12px sans-serif; fill: #666; }\n    </style>\n  </defs>\n\n  <rect width="100%" height="100%" fill="${theme.background}" rx="8"/>\n  <text class="title" x="${margin.left}" y="24">${username}'s Bubble Shooter Contributions</text>\n\n  <!-- cycle timer to orchestrate begin/end and restart -->\n  <rect id="cycleTimer" x="-10" y="-10" width="1" height="1" fill="none">\n    <animate id="cycle" attributeName="x" from="-10" to="-9" begin="0s;cycle.end+1s" dur="${total}s" fill="freeze"/>\n  </rect>\n\n  <!-- ceiling line and shooter base -->\n  <line x1="${originX}" y1="${originY - 6}" x2="${originX + gridW}" y2="${originY - 6}" stroke="#d0d7de"/>\n  <rect x="${shooterX - 16}" y="${shooterY - 10}" width="32" height="10" rx="5" fill="${theme.cannon}" opacity="0.9"/>\n  <polygon points="${shooterX - 5},${shooterY - 10} ${shooterX + 5},${shooterY - 10} ${shooterX},${shooterY - 22}" fill="${theme.cannon}"/>\n\n  <!-- grid of bubbles (top wall) -->\n  ${gridStr}\n\n  <!-- bullets -->\n  ${bulletsStr}\n\n  <!-- pops and particles -->\n  ${popsStr}\n</svg>`
  }

  const generateMarkdownCode = () => {
    const fileName = `${username}-contribution-animation.svg`
    return `![${username}'s Contribution Animation](${fileName})`
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

              {/* Non-contribution bubble color */}
              <div className="space-y-3">
                <label className="block text-gray-700 font-medium">No-contribution Bubble Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={noContributionColor}
                    onChange={(e) => setNoContributionColor(e.target.value)}
                    className="w-10 h-10 p-0 border rounded"
                    aria-label="Pick color for non-contribution bubbles"
                  />
                  <input
                    type="text"
                    value={noContributionColor}
                    onChange={(e) => setNoContributionColor(e.target.value)}
                    className="input-field flex-1"
                    placeholder="#ebedf0"
                  />
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {[
                    { label: 'GitHub Gray', value: '#ebedf0' },
                    { label: 'Warm Gray', value: '#e5e7eb' },
                    { label: 'Cool Gray', value: '#e2e8f0' },
                    { label: 'Light', value: '#f3f4f6' },
                    { label: 'Dark', value: '#cbd5e1' }
                  ].map(p => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setNoContributionColor(p.value)}
                      className="px-2 py-1 text-xs rounded border bg-white hover:bg-gray-50"
                    >
                      <span className="inline-block w-3 h-3 rounded-sm mr-2 align-middle" style={{ backgroundColor: p.value }} />
                      {p.label}
                    </button>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <input
                    id="hideZero"
                    type="checkbox"
                    checked={hideZeroDays}
                    onChange={(e) => setHideZeroDays(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="hideZero" className="text-sm text-gray-700">Hide days with 0 contributions</label>
                </div>
                <p className="text-xs text-gray-500">This color is used for days with 0 contributions.</p>
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

          {/* Full-width Live Preview below both containers */}
          <div className="mt-10">
            <h4 className="text-gray-800 font-semibold mb-3">Live Preview</h4>
            <div className="border border-gray-200 rounded-lg bg-white p-3 w-full">
              <div dangerouslySetInnerHTML={{ __html: generateSvgCode() }} />
            </div>
            <p className="text-xs text-gray-500 mt-2">Preview uses the same SVG you’ll download.</p>
          </div>

        </motion.div>
      </div>
    </section>
  )
}

export default CodeGenerator