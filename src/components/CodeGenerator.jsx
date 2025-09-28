import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Copy, Check, Download, Code, Palette, Settings } from 'lucide-react'
import generatorScript from '../../scripts/generate-svg.cjs?raw'

const CodeGenerator = ({ username, contributionData }) => {
  const [copied, setCopied] = useState(false)
  const [copiedWorkflow, setCopiedWorkflow] = useState(false)
  const [copiedScript, setCopiedScript] = useState(false)
  const [copiedReadme, setCopiedReadme] = useState(false)
  const [selectedTheme, setSelectedTheme] = useState('default')
  const [animationSpeed, setAnimationSpeed] = useState('normal')
  const [noContributionColor, setNoContributionColor] = useState('#ebedf0')
  const [hideZeroDays, setHideZeroDays] = useState(false)
  const [animatedFileName, setAnimatedFileName] = useState(`${username}-contribution-animation.svg`)
  const [staticFileName, setStaticFileName] = useState(`${username}-contributions.svg`)
  const [readmeMode, setReadmeMode] = useState('auto') // 'auto' | 'light' | 'dark'

  // Keep default filenames in sync with username; user can override afterwards
  useEffect(() => {
    setAnimatedFileName(`${username}-contribution-animation.svg`)
    setStaticFileName(`${username}-contributions.svg`)
  }, [username])

  const themes = {
    default: {
      name: 'Default',
      shooter: '#4f46e5',
      explosion: '#ff6b35',
      background: '#ffffff'
    },
    github: {
      name: 'GitHub',
      shooter: '#216e39',
      explosion: '#ff4444',
      background: '#f6f8fa'
    },
    ocean: {
      name: 'Ocean',
      shooter: '#0ea5e9',
      explosion: '#f97316',
      background: '#f0f9ff'
    },
    sunset: {
      name: 'Sunset',
      shooter: '#dc2626',
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
      speedMul,
      transparent: true
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
  const buildBubbleShooterSVG = ({ username, data, width, height, theme, speedMul, transparent = false }) => {
    // Tight layout to match static graph: no outer margins; viewBox fits grid + shooter only
    const margin = { left: 0, top: 0, right: 0, bottom: 0 }
    const weeks = data.length
    const days = 7
    // Match static graph sizing logic
    const cell = Math.max(10, Math.min(14, Math.floor(width / Math.max(30, weeks))))
    const radius = Math.floor(cell * 0.45)
    const gridW = weeks * cell
    const gridH = days * cell
    const originX = 0
    const originY = 0

    const shooterX = originX + gridW / 2
    const shooterYOffset = 26
    const shooterY = originY + gridH + shooterYOffset

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
        bulletsStr += `\n      <circle cx="${shooterX}" cy="${shooterY}" r="3.5" fill="${theme.shooter}" opacity="0">\n        <set attributeName="opacity" to="1" begin="cycle.begin+${begin}s"/>\n        <animate id="${shotId}" attributeName="cy" from="${shooterY}" to="${t.cy}" begin="cycle.begin+${begin}s" dur="${tShot}s" fill="freeze"/>\n        <animate attributeName="cx" from="${shooterX}" to="${t.cx}" begin="cycle.begin+${begin}s" dur="${tShot}s" fill="freeze"/>\n        <set attributeName="opacity" to="0" begin="${shotId}.end"/>\n      </circle>`

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

    // Build final SVG (legend removed) with tight viewBox
    const bgRect = transparent ? '' : `\n  <rect width=\"100%\" height=\"100%\" fill=\"${theme.background}\" rx=\"8\"/>`
    const vbW = gridW
    const vbH = gridH + shooterYOffset
    return `<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<svg width=\"100%\" viewBox=\"0 0 ${vbW} ${vbH}\" preserveAspectRatio=\"xMidYMid meet\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\">\n  <defs>\n    <style>\n      .title { font: 600 16px/1.2 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Ubuntu,Cantarell,'Noto Sans',sans-serif; fill: #111; }\n      .meta { font: 12px sans-serif; fill: #666; }\n    </style>\n  </defs>\n${bgRect}\n  <!-- cycle timer to orchestrate begin/end and restart -->\n  <rect id=\"cycleTimer\" x=\"-10\" y=\"-10\" width=\"1\" height=\"1\" fill=\"none\">\n    <animate id=\"cycle\" attributeName=\"x\" from=\"-10\" to=\"-9\" begin=\"0s;cycle.end+1s\" dur=\"${total}s\" fill=\"freeze\"/>\n  </rect>\n\n  <!-- shooter base -->\n  <rect x=\"${shooterX - 16}\" y=\"${shooterY - 10}\" width=\"32\" height=\"10\" rx=\"5\" fill=\"${theme.shooter}\" opacity=\"0.9\"/>\n  <polygon points=\"${shooterX - 5},${shooterY - 10} ${shooterX + 5},${shooterY - 10} ${shooterX},${shooterY - 22}\" fill=\"${theme.shooter}\"/>\n\n  <!-- grid of bubbles (top wall) -->\n  ${gridStr}\n\n  <!-- bullets -->\n  ${bulletsStr}\n\n  <!-- pops and particles -->\n  ${popsStr}\n</svg>`
  }

  // Build a static contribution graph (no animation), transparent by default
  const buildStaticGraphSVG = ({ data, width, height }) => {
    const weeks = data.length
    const days = 7
    const cell = Math.max(10, Math.min(14, Math.floor(width / Math.max(30, weeks))))
    const gridW = weeks * cell
    const gridH = days * cell
    const originX = 0
    const originY = 0

    let gridStr = ''
    data.forEach((week, wi) => {
      week.forEach((day, di) => {
        const x = originX + wi * cell + 2
        const y = originY + di * cell + 2
        const size = cell - 4
        const fill = getContributionColorForLevel(day.level)
        gridStr += `\n    <rect x="${x}" y="${y}" width="${size}" height="${size}" rx="2" fill="${fill}"/>`
      })
    })

    return `<?xml version="1.0" encoding="UTF-8"?>\n<svg width="100%" viewBox="0 0 ${gridW} ${gridH}" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">\n  ${gridStr}\n</svg>`
  }

  const generateMarkdownCode = () => {
    const fileName = animatedFileName || `${username}-contribution-animation.svg`
    return `![${username}'s Contribution Animation](${fileName})`
  }

  // Build README snippet by mode (auto/light/dark)
  const buildReadmeSnippet = () => {
    const base = animatedFileName || `${username}-contribution-animation.svg`
    if (readmeMode === 'dark') {
      const dark = base.endsWith('.svg') ? base.replace(/\.svg$/, '-dark.svg') : `${base}-dark.svg`
      return `![${username}'s Contribution Animation](${dark})`
    }
    if (readmeMode === 'light') {
      return `![${username}'s Contribution Animation](${base})`
    }
    const dark = base.endsWith('.svg') ? base.replace(/\.svg$/, '-dark.svg') : `${base}-dark.svg`
    return `<picture>\n  <source media="(prefers-color-scheme: dark)" srcset="${dark}" />\n  <img alt="${username}'s Contribution Animation" src="${base}" />\n</picture>`
  }

  // Provide a ready-to-copy GitHub Actions workflow to auto-generate the SVG daily
  const generateWorkflowYAML = () => [
    'name: Generate Contribution Animation',
    '',
    '# Runs every day at 00:00 UTC, on manual dispatch, and on pushes to main',
    'on:',
    '  schedule:',
    "    - cron: '0 0 * * *'",
    '  workflow_dispatch: {}',
    '  push:',
    '    branches: [ main ]',
    '',
    'permissions:',
    '  contents: write  # required to commit the generated SVG back to the repo',
    '',
    'jobs:',
    '  build:',
    '    runs-on: ubuntu-latest',
    '    steps:',
    '      - name: Checkout',
    '        uses: actions/checkout@v4',
    '        with:',
    '          fetch-depth: 0',
    '',
  '      - name: Setup Node',
    '        uses: actions/setup-node@v4',
    '        with:',
  "          node-version: '20'",
    '',
    '      - name: Generate animated SVG',
    '        run: node scripts/generate-svg.cjs',
    '        env:',
    '          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}',
    '',
  '      - name: Commit and push SVG',
    '        uses: stefanzweifel/git-auto-commit-action@v5',
    '        with:',
    "          commit_message: 'chore: update contribution animation [skip ci]'",
    '          file_pattern: "*-contribution-animation*.svg contribution-animation*.svg github-contribution-animation*.svg"',
  ].join('\n')

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateMarkdownCode())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleCopyWorkflow = async () => {
    try {
      await navigator.clipboard.writeText(generateWorkflowYAML())
      setCopiedWorkflow(true)
      setTimeout(() => setCopiedWorkflow(false), 2000)
    } catch (err) {
      console.error('Failed to copy workflow:', err)
    }
  }

  const handleCopyScript = async () => {
    try {
      await navigator.clipboard.writeText(generatorScript)
      setCopiedScript(true)
      setTimeout(() => setCopiedScript(false), 2000)
    } catch (err) {
      console.error('Failed to copy script:', err)
    }
  }

  const handleCopyReadme = async () => {
    const snippet = buildReadmeSnippet()
    try {
      await navigator.clipboard.writeText(snippet)
      setCopiedReadme(true)
      setTimeout(() => setCopiedReadme(false), 2000)
    } catch (err) {
      console.error('Failed to copy README snippet:', err)
    }
  }

  const downloadAnimated = () => {
    const theme = themes[selectedTheme]
    const speedMul = animationSpeed === 'fast' ? 0.6 : animationSpeed === 'slow' ? 1.6 : 1
    const svgContent = buildBubbleShooterSVG({
      username,
      data: contributionData,
      width: defaultViewBox.width,
      height: defaultViewBox.height,
      theme,
      speedMul,
      transparent: true
    })
    const blob = new Blob([svgContent], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
  a.download = animatedFileName || `${username}-contribution-animation.svg`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const downloadStaticGraph = () => {
    const svgContent = buildStaticGraphSVG({
      data: contributionData,
      width: defaultViewBox.width,
      height: defaultViewBox.height
    })
    const blob = new Blob([svgContent], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
  a.download = staticFileName || `${username}-contributions.svg`
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
                          style={{ backgroundColor: theme.shooter }}
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

              {/* Background option removed: animated export is always background-free */}

              {/* Filenames & Download Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="block text-gray-700 text-sm">Animated filename</label>
                  <input
                    type="text"
                    value={animatedFileName}
                    onChange={(e) => setAnimatedFileName(e.target.value)}
                    className="input-field w-full"
                    placeholder={`${username}-contribution-animation.svg`}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-gray-700 text-sm">Static graph filename</label>
                  <input
                    type="text"
                    value={staticFileName}
                    onChange={(e) => setStaticFileName(e.target.value)}
                    className="input-field w-full"
                    placeholder={`${username}-contributions.svg`}
                  />
                </div>
              </div>

              {/* Download Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={downloadAnimated}
                  className="w-full btn-secondary flex items-center justify-center space-x-2"
                >
                  <Download className="w-5 h-5" />
                  <span>Download Animated</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={downloadStaticGraph}
                  className="w-full btn-secondary flex items-center justify-center space-x-2"
                >
                  <Download className="w-5 h-5" />
                  <span>Download Static Graph</span>
                </motion.button>
              </div>
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

          {/* Automate with GitHub Actions (for users of the website) */}
          <div className="mt-10">
            <h4 className="text-gray-800 font-semibold mb-3">Automate in your own repo</h4>
            <div className="border border-gray-200 rounded-lg bg-white p-4 w-full space-y-4">
              <ol className="text-gray-700 text-sm space-y-3 list-decimal list-inside">
                <li>
                  Create the generator script at <code className="bg-gray-100 px-1 rounded text-xs">scripts/generate-svg.cjs</code>.
                </li>
              </ol>

              {/* Generator script content with copy button */}
              <div className="bg-gray-900 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-xs font-mono">scripts/generate-svg.cjs</span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCopyScript}
                    className="px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs text-gray-100"
                  >
                    {copiedScript ? 'Copied!' : 'Copy script'}
                  </motion.button>
                </div>
                <pre className="text-gray-100 text-[11px] leading-4 overflow-auto max-h-96"><code>{generatorScript}</code></pre>
              </div>

              <ol start={2} className="text-gray-700 text-sm space-y-3 list-decimal list-inside">
                <li>
                  Create the workflow file at <code className="bg-gray-100 px-1 rounded text-xs">.github/workflows/generate-contribution-animation.yml</code> and paste the content below.
                </li>
              </ol>

              <div className="bg-gray-900 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-xs font-mono">.github/workflows/generate-contribution-animation.yml</span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCopyWorkflow}
                    className="px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs text-gray-100"
                  >
                    {copiedWorkflow ? 'Copied!' : 'Copy YAML'}
                  </motion.button>
                </div>
                <pre className="text-gray-100 text-[11px] leading-4 overflow-auto"><code>{generateWorkflowYAML()}</code></pre>
              </div>

              <ol start={3} className="text-gray-700 text-sm space-y-3 list-decimal list-inside">
                <li>
                  Commit and push both files to your repository. This will also trigger the workflow on push.
                </li>
                <li>
                  Add this Markdown to your README where you want the animation to appear:
                </li>
              </ol>

              <div className="bg-gray-900 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-xs font-mono">README snippet</span>
                  <div className="flex items-center gap-2">
                    <div className="inline-flex rounded overflow-hidden border border-gray-700">
                      <button
                        type="button"
                        onClick={() => setReadmeMode('auto')}
                        className={`px-2 py-1 text-xs ${readmeMode === 'auto' ? 'bg-gray-700 text-gray-100' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                        title="Auto (light + dark)"
                      >Auto</button>
                      <button
                        type="button"
                        onClick={() => setReadmeMode('light')}
                        className={`px-2 py-1 text-xs border-l border-gray-700 ${readmeMode === 'light' ? 'bg-gray-700 text-gray-100' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                        title="Light only"
                      >Light</button>
                      <button
                        type="button"
                        onClick={() => setReadmeMode('dark')}
                        className={`px-2 py-1 text-xs border-l border-gray-700 ${readmeMode === 'dark' ? 'bg-gray-700 text-gray-100' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                        title="Dark only"
                      >Dark</button>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleCopyReadme}
                      className="px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs text-gray-100"
                    >
                      {copiedReadme ? 'Copied!' : 'Copy'}
                    </motion.button>
                  </div>
                </div>
                <pre className="text-green-200 text-[11px] leading-4 overflow-auto"><code>{buildReadmeSnippet()}</code></pre>
              </div>

              <ol start={5} className="text-gray-700 text-sm space-y-3 list-decimal list-inside">
                <li>
                  Trigger the workflow: go to the Actions tab in your repo, select
                  <span className="mx-1 italic">Generate Contribution Animation</span>, and click <span className="italic">Run workflow</span>. Or simply push again.
                </li>
                <li>
                  Verify the generated SVG files appear at the repo root (e.g.,
                  <code className="bg-gray-100 px-1 rounded text-xs ml-1">github-contribution-animation.svg</code> and <code className="bg-gray-100 px-1 rounded text-xs ml-1">github-contribution-animation-dark.svg</code>), and that your README image renders.
                </li>
              </ol>

              <div className="text-xs text-gray-500">
                <p>Notes:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>No extra token required: the workflow uses the built‑in <code className="bg-gray-100 px-1 rounded">GITHUB_TOKEN</code>.</li>
                  <li>If your default branch isn’t <code className="bg-gray-100 px-1 rounded">main</code>, update the workflow’s <code className="bg-gray-100 px-1 rounded">push.branches</code> accordingly.</li>
                  <li>If branch protection blocks workflow commits, allow workflow commits or commit to another branch and reference that file in your README.</li>
                </ul>
              </div>

              {/* What the generator script does */}
              <div className="mt-4 text-sm text-gray-700">
                <h5 className="font-semibold mb-2">What does <code className="bg-gray-100 px-1 rounded text-xs">scripts/generate-svg.cjs</code> do?</h5>
                <ul className="list-disc list-inside space-y-1">
                  <li>Runs in GitHub Actions (headless) and reads your repo owner as the GitHub username.</li>
                  <li>Uses the GitHub GraphQL API with <code className="bg-gray-100 px-1 rounded text-xs">GITHUB_TOKEN</code> to fetch your contribution calendar data.</li>
                  <li>Builds an animated SVG from that data.</li>
                  <li>Writes these files at the repo root: <code className="bg-gray-100 px-1 rounded text-xs">{`${username}-contribution-animation.svg`}</code>, <code className="bg-gray-100 px-1 rounded text-xs">contribution-animation.svg</code>, <code className="bg-gray-100 px-1 rounded text-xs">github-contribution-animation.svg</code>, and their <code className="bg-gray-100 px-1 rounded text-xs">*-dark.svg</code> equivalents for dark mode.</li>
                  <li>The workflow then commits the SVGs so your README always points at the latest version.</li>
                </ul>
                <p className="text-xs text-gray-500 mt-2">Tip: It’s designed for GitHub Actions. You can run it locally if you export <code className="bg-gray-100 px-1 rounded">GITHUB_TOKEN</code> and set <code className="bg-gray-100 px-1 rounded">GITHUB_REPOSITORY</code>, but the automated workflow is the recommended path.</p>
              </div>
            </div>
          </div>

          

        </motion.div>
      </div>
    </section>
  )
}

export default CodeGenerator