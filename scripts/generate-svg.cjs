#!/usr/bin/env node

const fs = require('fs');
const https = require('https');

/**
 * GitHub Contribution Animation Generator
 * Generates animated SVG similar to snake animation but with popping contribution boxes
 */

// Get username from repository owner
const username = process.env.GITHUB_REPOSITORY?.split('/')[0] || 'Man0dya';

console.log(`🎯 Generating contribution animation for: ${username}`);

/**
 * Fetch contribution data from GitHub API
 */
async function fetchContributionData(username) {
  return new Promise((resolve, reject) => {
    const query = `
      query($username: String!) {
        user(login: $username) {
          contributionsCollection {
            contributionCalendar {
              weeks {
                contributionDays {
                  contributionCount
                  contributionLevel
                  date
                  weekday
                }
              }
            }
          }
        }
      }
    `;

    const postData = JSON.stringify({
      query,
      variables: { username }
    });

    const options = {
      hostname: 'api.github.com',
      port: 443,
      path: '/graphql',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'contribution-canon-generator'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.errors) {
            throw new Error(`GraphQL Error: ${JSON.stringify(response.errors)}`);
          }
          resolve(response.data.user.contributionsCollection.contributionCalendar.weeks);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

/**
 * Get contribution color based on level
 */
function getContributionColor(level) {
  const colors = {
    'NONE': '#ebedf0',
    'FIRST_QUARTILE': '#9be9a8',
    'SECOND_QUARTILE': '#40c463',
    'THIRD_QUARTILE': '#30a14e',
    'FOURTH_QUARTILE': '#216e39'
  };
  return colors[level] || colors['NONE'];
}

/**
 * Generate animated SVG
 */
function generateAnimatedSVG(weeks, username) {
  // Process contribution data
  const contributionCells = [];
  const processedWeeks = [];
  
  weeks.forEach((week, weekIndex) => {
    const processedDays = week.contributionDays.map((day, dayIndex) => ({
      count: day.contributionCount,
      level: day.contributionLevel,
      date: day.date,
      color: getContributionColor(day.contributionLevel)
    }));
    
    processedWeeks.push(processedDays);
    
    // Collect cells with contributions for animation
    week.contributionDays.forEach((day, dayIndex) => {
      if (day.contributionCount > 0) {
        contributionCells.push({
          weekIndex,
          dayIndex,
          count: day.contributionCount,
          level: day.contributionLevel,
          x: weekIndex * 11 + 1,
          y: dayIndex * 11 + 1,
          color: getContributionColor(day.contributionLevel)
        });
      }
    });
  });

  const svgWidth = 800;
  const svgHeight = 200;
  const cellSize = 11;
  const animationDuration = Math.max(contributionCells.length * 0.6, 10); // Minimum 10 seconds
  
  console.log(`📊 Found ${contributionCells.length} contribution cells to animate`);
  console.log(`⏱️ Animation duration: ${animationDuration}s`);

  // Generate SVG content
  const svg = `<svg width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .contribution-grid { 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; 
      }
      .contribution-cell-animated { 
        animation: pop-sequence ${animationDuration}s infinite linear;
        transform-origin: center;
      }
      
      @keyframes pop-sequence {
        0%, 95% { 
          transform: scale(1) rotate(0deg); 
          opacity: 1; 
        }
        1% { 
          transform: scale(1.4) rotate(10deg); 
          opacity: 0.9; 
        }
        2% { 
          transform: scale(0.7) rotate(-5deg); 
          opacity: 0.7; 
        }
        3% { 
          transform: scale(1.2) rotate(3deg); 
          opacity: 0.5; 
        }
        4% { 
          transform: scale(0) rotate(0deg); 
          opacity: 0; 
        }
        5%, 100% { 
          transform: scale(1) rotate(0deg); 
          opacity: 1; 
        }
      }
      
      .explosion-particle {
        animation: explode ${animationDuration}s infinite linear;
      }
      
      @keyframes explode {
        0%, 95% { opacity: 0; transform: translate(0, 0) scale(0); }
        1% { opacity: 1; transform: translate(0, 0) scale(1); }
        2% { opacity: 0.8; transform: translate(var(--dx), var(--dy)) scale(0.8); }
        3% { opacity: 0.4; transform: translate(calc(var(--dx) * 1.5), calc(var(--dy) * 1.5)) scale(0.4); }
        4%, 100% { opacity: 0; transform: translate(calc(var(--dx) * 2), calc(var(--dy) * 2)) scale(0); }
      }
    </style>
  </defs>
  
  <!-- Background -->
  <rect width="100%" height="100%" fill="#ffffff" rx="8"/>
  
  <!-- Title -->
  <text x="20" y="30" font-family="sans-serif" font-size="18" font-weight="bold" fill="#24292f">
    ${username}'s Contribution Animation
  </text>
  
  <!-- Subtitle -->
  <text x="20" y="45" font-family="sans-serif" font-size="12" fill="#656d76">
    ${contributionCells.length} contributions this year • Updates daily
  </text>
  
  <!-- Main Grid Container -->
  <g class="contribution-grid" transform="translate(20, 60)">
    ${generateBackgroundGrid(processedWeeks)}
    ${generateAnimatedCells(contributionCells, animationDuration)}
  </g>
  
  <!-- Legend -->
  <g transform="translate(20, ${svgHeight - 25})">
    <text x="0" y="0" font-family="sans-serif" font-size="11" fill="#656d76">Less</text>
    ${['NONE', 'FIRST_QUARTILE', 'SECOND_QUARTILE', 'THIRD_QUARTILE', 'FOURTH_QUARTILE']
      .map((level, i) => 
        `<rect x="${50 + i * 15}" y="-9" width="9" height="9" rx="2" fill="${getContributionColor(level)}"/>`
      ).join('')}
    <text x="${50 + 5 * 15 + 15}" y="0" font-family="sans-serif" font-size="11" fill="#656d76">More</text>
  </g>
  
  <!-- Watermark -->
  <text x="${svgWidth - 10}" y="${svgHeight - 8}" font-family="sans-serif" font-size="9" fill="#8b949e" text-anchor="end">
    🎯 github.com/Man0dya/contribution-canon
  </text>
</svg>`;

  return svg;
}

/**
 * Generate background grid (all contribution cells)
 */
function generateBackgroundGrid(weeks) {
  let grid = '';
  
  weeks.forEach((week, weekIndex) => {
    week.forEach((day, dayIndex) => {
      const x = weekIndex * 11 + 1;
      const y = dayIndex * 11 + 1;
      grid += `    <rect x="${x}" y="${y}" width="9" height="9" rx="2" fill="${day.color}"/>
`;
    });
  });
  
  return grid;
}

/**
 * Generate animated contribution cells
 */
function generateAnimatedCells(contributionCells, totalDuration) {
  let animatedCells = '';
  
  contributionCells.forEach((cell, index) => {
    const animationDelay = (index / contributionCells.length) * totalDuration * 0.8; // Stagger across 80% of duration
    
    // Main animated cell
    animatedCells += `    <rect class="contribution-cell-animated" 
      x="${cell.x}" y="${cell.y}" 
      width="9" height="9" rx="2" 
      fill="${cell.color}"
      style="animation-delay: ${animationDelay.toFixed(2)}s;">
    </rect>
`;
    
    // Explosion particles
    const particlePositions = [
      { dx: -8, dy: -8 }, { dx: 8, dy: -8 },
      { dx: -8, dy: 8 }, { dx: 8, dy: 8 },
      { dx: 0, dy: -10 }, { dx: 0, dy: 10 }
    ];
    
    particlePositions.forEach((pos, pIndex) => {
      animatedCells += `    <circle class="explosion-particle" 
        cx="${cell.x + 4.5}" cy="${cell.y + 4.5}" r="1.5" 
        fill="#ffd700" opacity="0"
        style="--dx: ${pos.dx}px; --dy: ${pos.dy}px; animation-delay: ${animationDelay.toFixed(2)}s;">
      </circle>
`;
    });
  });
  
  return animatedCells;
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log('🔄 Fetching contribution data from GitHub API...');
    const weeks = await fetchContributionData(username);
    
    console.log('🎨 Generating animated SVG...');
    const svg = generateAnimatedSVG(weeks, username);
    
    // Write SVG files
    const outputs = [
      { filename: `${username}-contribution-animation.svg`, content: svg },
      { filename: 'contribution-animation.svg', content: svg }, // Generic filename
      { filename: 'github-contribution-animation.svg', content: svg } // Snake-style naming
    ];
    
    outputs.forEach(({ filename, content }) => {
      fs.writeFileSync(filename, content);
      console.log(`✅ Generated: ${filename}`);
    });
    
    console.log(`🎯 Animation ready! Add this to your README:`);
    console.log(`![Contribution Animation](${username}-contribution-animation.svg)`);
    
  } catch (error) {
    console.error('❌ Error generating animation:', error.message);
    process.exit(1);
  }
}

// Run the generator
main();