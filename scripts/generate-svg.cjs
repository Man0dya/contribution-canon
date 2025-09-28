#!/usr/bin/env node

const fs = require('fs');
const https = require('https');

// Bubble-shooter animated SVG generator (SMIL-based), background-free

// Get username from repository owner
const username = (process.env.GITHUB_REPOSITORY && process.env.GITHUB_REPOSITORY.split('/')[0]) || 'Man0dya';
const githubToken = process.env.GITHUB_TOKEN;

console.log(`🎯 Generating bubble-shooter animation for: ${username}`);
console.log(`📦 Repository: ${process.env.GITHUB_REPOSITORY || 'Not set'}`);
console.log(`🔑 Token available: ${githubToken ? 'Yes' : 'No'}`);

if (!githubToken) {
  console.error('❌ GITHUB_TOKEN is required but not provided');
  process.exit(1);
}

// Fetch contribution data from GitHub GraphQL
async function fetchContributionData(login) {
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

    const postData = JSON.stringify({ query, variables: { username: login } });

    const req = https.request(
      {
        hostname: 'api.github.com',
        port: 443,
        path: '/graphql',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${githubToken}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          'User-Agent': 'contribution-animation-generator',
          Accept: 'application/vnd.github.v4+json',
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            if (res.statusCode !== 200) {
              throw new Error(`GitHub API status ${res.statusCode}`);
            }
            const response = JSON.parse(data);
            if (response.errors) {
              throw new Error(`GraphQL Error: ${JSON.stringify(response.errors)}`);
            }
            const weeks = response?.data?.user?.contributionsCollection?.contributionCalendar?.weeks;
            if (!weeks) throw new Error('Invalid response structure from GitHub API');
            resolve(weeks);
          } catch (e) {
            console.error('❌ Error parsing response:', e.message);
            console.error('📄 Raw response:', data);
            reject(e);
          }
        });
      }
    );

    req.on('error', (err) => reject(err));
    req.write(postData);
    req.end();
  });
}

// Map GraphQL level to numeric 0-4
function levelToNumber(level) {
  const map = {
    NONE: 0,
    FIRST_QUARTILE: 1,
    SECOND_QUARTILE: 2,
    THIRD_QUARTILE: 3,
    FOURTH_QUARTILE: 4,
  };
  return map[level] ?? 0;
}

function getColorForLevel(numLevel, noContributionColor = '#ebedf0') {
  const colors = {
    0: noContributionColor,
    1: '#9be9a8',
    2: '#40c463',
    3: '#30a14e',
    4: '#216e39',
  };
  return colors[numLevel] || colors[0];
}

// Build Bubble Shooter SVG (SMIL)
function buildBubbleShooterSVG({ data, width = 1200, height = 340, theme, speedMul = 1, noContributionColor = '#ebedf0', transparent = true }) {
  const weeks = data.length;
  const days = 7;
  const cell = Math.max(10, Math.min(14, Math.floor(width / Math.max(30, weeks))));
  const radius = Math.floor(cell * 0.45);
  const gridW = weeks * cell;
  const gridH = days * cell;
  const originX = 0;
  const originY = 0;

  const shooterX = originX + gridW / 2;
  const shooterYOffset = 26;
  const shooterY = originY + gridH + shooterYOffset;

  // Build bubbles with centers
  const bubbles = [];
  data.forEach((week, wi) => {
    week.forEach((day, di) => {
      const cx = originX + wi * cell + cell / 2;
      const cy = originY + di * cell + cell / 2;
      const lvl = levelToNumber(day.level);
      const isGreen = day.count > 0;
      bubbles.push({ cx, cy, level: lvl, isGreen });
    });
  });

  const targets = bubbles.filter((b) => b.isGreen).slice(0, 220);
  const tShot = 0.6 * speedMul;
  const tGap = 0.25 * speedMul;
  const total = targets.length > 0 ? targets.length * (tShot + tGap) + 0.5 : 2;

  const shotIndexByPos = new Map();
  targets.forEach((t, i) => shotIndexByPos.set(`${t.cx},${t.cy}`, i));

  // Grid with embedded pop/color animations
  let gridStr = '';
  bubbles.forEach((b, idx) => {
    const fill = getColorForLevel(b.level, noContributionColor);
    const key = `${b.cx},${b.cy}`;
    const shotIndex = shotIndexByPos.get(key);
    let anims = `\n          <set attributeName="opacity" to="1" begin="cycle.begin"/>\n          <set attributeName="r" to="${radius}" begin="cycle.begin"/>\n          <set attributeName="fill" to="${fill}" begin="cycle.begin"/>`;
    if (shotIndex !== undefined) {
      const popUp = (radius * 1.35).toFixed(2);
      anims += `\n          <animate attributeName="r" from="${radius}" to="${popUp}" begin="shot-${shotIndex}.end" dur="0.12s" fill="freeze"/>\n          <animate attributeName="r" from="${popUp}" to="${radius}" begin="shot-${shotIndex}.end+0.12s" dur="0.12s" fill="freeze"/>\n          <animate attributeName="opacity" from="1" to="0" begin="shot-${shotIndex}.end+0.12s" dur="0.06s" fill="freeze"/>\n          <set attributeName="fill" to="${noContributionColor}" begin="shot-${shotIndex}.end+0.19s"/>\n          <animate attributeName="opacity" from="0" to="1" begin="shot-${shotIndex}.end+0.22s" dur="0.08s" fill="freeze"/>`;
    }
    gridStr += `\n      <circle cx="${b.cx}" cy="${b.cy}" r="${radius}" fill="${fill}" opacity="1">${anims}\n      </circle>`;
  });

  // Bullets and pops
  let bulletsStr = '';
  let popsStr = '';
  targets.forEach((t, i) => {
    const begin = (i * (tShot + tGap)).toFixed(3);
    const shotId = `shot-${i}`;
    bulletsStr += `\n      <circle cx="${shooterX}" cy="${shooterY}" r="3.5" fill="${theme.shooter}" opacity="0">\n        <set attributeName="opacity" to="1" begin="cycle.begin+${begin}s"/>\n        <animate id="${shotId}" attributeName="cy" from="${shooterY}" to="${t.cy}" begin="cycle.begin+${begin}s" dur="${tShot}s" fill="freeze"/>\n        <animate attributeName="cx" from="${shooterX}" to="${t.cx}" begin="cycle.begin+${begin}s" dur="${tShot}s" fill="freeze"/>\n        <set attributeName="opacity" to="0" begin="${shotId}.end"/>\n      </circle>`;

    popsStr += `\n      <circle cx="${t.cx}" cy="${t.cy}" r="${radius}" fill="none" stroke="${theme.explosion}" stroke-width="2" opacity="0">\n        <set attributeName="opacity" to="1" begin="${shotId}.end"/>\n        <animate attributeName="r" from="${radius}" to="${(radius * 1.8).toFixed(2)}" begin="${shotId}.end" dur="0.35s" fill="freeze"/>\n        <animate attributeName="opacity" from="1" to="0" begin="${shotId}.end" dur="0.35s" fill="freeze"/>\n      </circle>`;

    for (let pi = 0; pi < 6; pi++) {
      const ang = (pi * Math.PI) / 3;
      const px = (t.cx + Math.cos(ang) * (radius * 1.6)).toFixed(2);
      const py = (t.cy + Math.sin(ang) * (radius * 1.6)).toFixed(2);
      popsStr += `\n      <circle cx="${t.cx}" cy="${t.cy}" r="1.6" fill="#ffd700" opacity="1">\n        <animate attributeName="cx" from="${t.cx}" to="${px}" begin="${shotId}.end" dur="0.35s" fill="freeze"/>\n        <animate attributeName="cy" from="${t.cy}" to="${py}" begin="${shotId}.end" dur="0.35s" fill="freeze"/>\n        <animate attributeName="opacity" from="1" to="0" begin="${shotId}.end" dur="0.35s" fill="freeze"/>\n      </circle>`;
    }
  });

  const bgRect = transparent ? '' : `\n  <rect width="100%" height="100%" fill="#ffffff" rx="8"/>`;
  const vbW = gridW;
  const vbH = gridH + shooterYOffset;

  return `<?xml version="1.0" encoding="UTF-8"?>\n<svg width="100%" viewBox="0 0 ${vbW} ${vbH}" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">\n${bgRect}
  <!-- cycle timer to orchestrate begin/end and restart -->
  <rect id="cycleTimer" x="-10" y="-10" width="1" height="1" fill="none">
    <animate id="cycle" attributeName="x" from="-10" to="-9" begin="0s;cycle.end+1s" dur="${total}s" fill="freeze"/>
  </rect>

  <!-- shooter base -->
  <rect x="${shooterX - 16}" y="${shooterY - 10}" width="32" height="10" rx="5" fill="${theme.shooter}" opacity="0.9"/>
  <polygon points="${shooterX - 5},${shooterY - 10} ${shooterX + 5},${shooterY - 10} ${shooterX},${shooterY - 22}" fill="${theme.shooter}"/>

  <!-- grid of bubbles (top wall) -->
  ${gridStr}

  <!-- bullets -->
  ${bulletsStr}

  <!-- pops and particles -->
  ${popsStr}
</svg>`;
}

async function main() {
  try {
    console.log('🔄 Fetching contribution data from GitHub API...');
    const weeks = await fetchContributionData(username);

    // Normalize weeks to array of arrays with {count, level}
    const normalized = weeks.map((w) =>
      w.contributionDays.map((d) => ({
        count: d.contributionCount,
        level: d.contributionLevel,
        date: d.date,
      }))
    );

    // Themes for light and dark
    const lightTheme = {
      shooter: '#216e39', // GitHub green (light)
      explosion: '#ff6b35',
      noContribution: '#ebedf0',
    };
    const darkTheme = {
      shooter: '#39d353', // GitHub green (dark)
      explosion: '#ff9e64',
      noContribution: '#161b22', // GitHub dark empty cell color
    };

    console.log('🎨 Generating bubble-shooter SVG (light)...');
    const svgLight = buildBubbleShooterSVG({
      data: normalized,
      width: 1200,
      height: 340,
      theme: { shooter: lightTheme.shooter, explosion: lightTheme.explosion },
      speedMul: 1,
      noContributionColor: lightTheme.noContribution,
      transparent: true,
    });

    console.log('🌙 Generating bubble-shooter SVG (dark)...');
    const svgDark = buildBubbleShooterSVG({
      data: normalized,
      width: 1200,
      height: 340,
      theme: { shooter: darkTheme.shooter, explosion: darkTheme.explosion },
      speedMul: 1,
      noContributionColor: darkTheme.noContribution,
      transparent: true,
    });

    const outputs = [
      { filename: `${username}-contribution-animation.svg`, content: svgLight },
      { filename: 'contribution-animation.svg', content: svgLight },
      { filename: 'github-contribution-animation.svg', content: svgLight },
      { filename: `${username}-contribution-animation-dark.svg`, content: svgDark },
      { filename: 'contribution-animation-dark.svg', content: svgDark },
      { filename: 'github-contribution-animation-dark.svg', content: svgDark },
    ];
    outputs.forEach(({ filename, content }) => {
      fs.writeFileSync(filename, content);
      console.log(`✅ Generated: ${filename}`);
    });

  console.log('✅ Done. Embed in README (auto light/dark):');
  console.log('<picture>');
  console.log(`  <source media="(prefers-color-scheme: dark)" srcset="${username}-contribution-animation-dark.svg" />`);
  console.log(`  <img alt="Contribution Animation" src="${username}-contribution-animation.svg" />`);
  console.log('</picture>');
  } catch (error) {
    console.error('❌ Error generating animation:', error.message);
    process.exit(1);
  }
}

main();