/**
 * GitHub API utilities for fetching contribution data
 */

const GITHUB_API_BASE = 'https://api.github.com'

/**
 * Fetch GitHub user's contribution data
 * @param {string} username - GitHub username
 * @returns {Promise<Array>} Contribution data array
 */
export const fetchContributionData = async (username) => {
  console.log(`🚀 Starting real data fetch for: ${username}`)
  
  try {
    // First validate the username
    if (!validateUsername(username)) {
      console.error('❌ Username validation failed')
      throw new Error('Invalid GitHub username format')
    }
    console.log('✅ Username format is valid')

    // Check if user exists first
    console.log('👤 Verifying user exists...')
    const userProfile = await fetchUserProfile(username)
    console.log(`✅ User verified: ${userProfile.username} (${userProfile.publicRepos} public repos)`)
    
    // Fetch contribution data using multiple working methods
    console.log('📊 Attempting to fetch contribution graph data...')
    const contributionData = await fetchContributionGraphData(username)
    
    if (!contributionData || contributionData.length === 0) {
      console.error('❌ No contribution data returned from any method')
      throw new Error('No contribution data returned from any method')
    }
    
    // Count total contributions for verification
    const totalContributions = contributionData.flat().reduce((sum, day) => sum + day.count, 0)
    console.log(`🎯 Successfully fetched ${contributionData.length} weeks of real contribution data`)
    console.log(`📈 Total contributions found: ${totalContributions}`)
    
    // Log sample data for debugging
    if (contributionData.length > 0 && contributionData[0].length > 0) {
      console.log('📅 Sample contribution data:', contributionData[0][0])
    }
    
    return contributionData
    
  } catch (error) {
    console.error('❌ Real data fetch failed:', error.message)
    console.error('❌ Full error:', error)
    throw error // Don't return mock data, let the caller handle the error properly
  }
}

/**
 * Fetch GitHub contribution graph data using working methods
 * @param {string} username - GitHub username
 * @returns {Promise<Array>} Contribution data
 */
const fetchContributionGraphData = async (username) => {
  console.log(`🔍 Fetching REAL GitHub contribution data for: ${username}`)
  
  let lastError = null
  
  // Method 1: Fetch real GitHub contribution SVG/HTML (MOST ACCURATE)
  try {
    console.log('📡 Trying real GitHub contribution SVG method...')
    const contributionData = await fetchRealContributionSVG(username)
    if (contributionData && contributionData.length > 0) {
      const totalContributions = contributionData.flat().reduce((sum, day) => sum + day.count, 0)
      console.log(`✅ Successfully fetched REAL GitHub contribution data (${totalContributions} contributions)`)
      return contributionData
    }
  } catch (error) {
    console.warn('❌ Real GitHub SVG method failed:', error.message)
    lastError = error
  }
  
  // Method 2: Use GitHub's activity feed
  try {
    console.log('📡 Trying GitHub Activity Feed method...')
    const contributionData = await fetchContributionsFromActivity(username)
    if (contributionData && contributionData.length > 0) {
      const totalContributions = contributionData.flat().reduce((sum, day) => sum + day.count, 0)
      if (totalContributions > 0) {
        console.log(`✅ Successfully fetched real contribution data from Activity Feed (${totalContributions} contributions)`)
        return contributionData
      } else {
        console.warn('⚠️ Activity Feed returned data but no contributions found')
      }
    }
  } catch (error) {
    console.warn('❌ Activity Feed method failed:', error.message)
    lastError = error
  }
  
  // Method 3: Use a working CORS proxy with GitHub's contributions endpoint
  try {
    console.log('📡 Trying working CORS proxy...')
    const contributionData = await fetchContributionsViaProxy(username)
    if (contributionData && contributionData.length > 0) {
      const totalContributions = contributionData.flat().reduce((sum, day) => sum + day.count, 0)
      console.log(`✅ Successfully fetched real contribution data via proxy (${totalContributions} contributions)`)
      return contributionData
    }
  } catch (error) {
    console.warn('❌ CORS proxy method failed:', error.message)
    lastError = error
  }
  
  // Method 4: Generate realistic data based on user's repository activity
  try {
    console.log('📡 Trying repository-based contribution estimation...')
    const contributionData = await fetchContributionsFromRepositories(username)
    if (contributionData && contributionData.length > 0) {
      const totalContributions = contributionData.flat().reduce((sum, day) => sum + day.count, 0)
      console.log(`✅ Generated contribution estimates from repositories (${totalContributions} estimated contributions)`)
      return contributionData
    }
  } catch (error) {
    console.warn('❌ Repository estimation method failed:', error.message)
    lastError = error
  }
  
  // If all methods fail, throw an error with details
  throw new Error(`Unable to fetch real contribution data for ${username}. All methods failed. Last error: ${lastError?.message || 'Unknown error'}`)
}

/**
 * Parse contribution data from GitHub's HTML page
 * @param {string} html - HTML content from GitHub profile
 * @returns {Array} Parsed contribution data
 */
const parseContributionGraphFromHTML = (html) => {
  try {
    console.log('🔍 Parsing contribution HTML...')
    
    // Create a DOM parser to extract contribution data
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    
    // Try different selectors for contribution data
    const selectors = [
      'rect[data-date]',
      '.ContributionCalendar-day[data-date]',
      'rect[data-count]',
      '.js-calendar-graph-svg rect',
      'td[data-date]',
      '.day[data-date]'
    ]
    
    let contributionDays = null
    let usedSelector = null
    
    for (const selector of selectors) {
      contributionDays = doc.querySelectorAll(selector)
      if (contributionDays.length > 0) {
        console.log(`✅ Found ${contributionDays.length} contribution days using selector: ${selector}`)
        usedSelector = selector
        break
      } else {
        console.log(`❌ No elements found for selector: ${selector}`)
      }
    }
    
    if (!contributionDays || contributionDays.length === 0) {
      // Log what we do have for debugging
      console.log('🔍 Searching for contribution-related content...')
      const hasContributionText = html.includes('contributions') || html.includes('contribution')
      console.log(`Has contribution text: ${hasContributionText}`)
      
      // Look for SVG elements
      const svgElements = doc.querySelectorAll('svg')
      console.log(`Found ${svgElements.length} SVG elements`)
      
      // Look for rect elements without specific attributes
      const allRects = doc.querySelectorAll('rect')
      console.log(`Found ${allRects.length} rect elements total`)
      
      if (!hasContributionText) {
        throw new Error('No contribution-related content found in HTML')
      }
      
      throw new Error(`No contribution data elements found with any known selector. Found ${allRects.length} rect elements total.`)
    }
    
    // Group by weeks (GitHub shows 53 weeks)
    const weeks = []
    let currentWeek = []
    let weekIndex = 0
    let validDays = 0
    
    contributionDays.forEach((day, index) => {
      // Try multiple attribute names for date
      const date = day.getAttribute('data-date') || 
                  day.getAttribute('date') ||
                  day.getAttribute('data-day')
      
      // Try multiple attribute names for level and count
      const level = parseInt(
        day.getAttribute('data-level') || 
        day.getAttribute('data-contribution-level') ||
        day.getAttribute('level') ||
        '0'
      )
      
      const count = parseInt(
        day.getAttribute('data-count') || 
        day.getAttribute('data-contribution-count') ||
        day.getAttribute('count') ||
        '0'
      )
      
      if (!date) {
        console.warn(`Skipping day ${index} - no date found (attributes: ${Array.from(day.attributes).map(a => `${a.name}="${a.value}"`).join(', ')})`)
        return
      }
      
      validDays++
      
      const dayData = {
        date,
        count: isNaN(count) ? 0 : count,
        level: isNaN(level) ? (count > 0 ? Math.min(4, Math.ceil(count / 2)) : 0) : Math.min(4, Math.max(0, level)),
        weekIndex: Math.floor(validDays / 7),
        dayIndex: (validDays - 1) % 7
      }
      
      currentWeek.push(dayData)
      
      // Start new week every 7 days
      if (currentWeek.length === 7) {
        weeks.push(currentWeek)
        currentWeek = []
        weekIndex++
      }
    })
    
    // Add remaining days if any
    if (currentWeek.length > 0) {
      weeks.push(currentWeek)
    }
    
    if (weeks.length === 0) {
      throw new Error('No valid contribution weeks found')
    }
    
    // Log summary
    const totalContributions = weeks.flat().reduce((sum, day) => sum + day.count, 0)
    console.log(`✅ Successfully parsed ${weeks.length} weeks of contribution data`)
    console.log(`📊 Total contributions: ${totalContributions}`)
    console.log(`📅 Date range: ${weeks[0][0].date} to ${weeks[weeks.length-1][weeks[weeks.length-1].length-1].date}`)
    
    return weeks
    
  } catch (error) {
    console.error('❌ Error parsing contribution HTML:', error)
    throw error
  }
}

/**
 * Fetch contributions using GitHub's Events API
 * @param {string} username - GitHub username
 * @returns {Promise<Array>} Contribution data
 */
const fetchContributionsFromEvents = async (username) => {
  const now = new Date()
  const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
  
  // Initialize contribution map for the past year
  const contributionMap = new Map()
  
  // Generate all dates for the past year
  for (let d = new Date(oneYearAgo); d <= now; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0]
    contributionMap.set(dateStr, { count: 0, level: 0 })
  }
  
  try {
    // Fetch recent events (GitHub API allows up to 300 events per user without auth)
    const response = await fetch(`https://api.github.com/users/${username}/events/public?per_page=100`)
    
    if (!response.ok) {
      throw new Error(`GitHub Events API error: ${response.status}`)
    }
    
    const events = await response.json()
    console.log(`📊 Found ${events.length} recent events for ${username}`)
    
    // Process events and count contributions by date
    events.forEach(event => {
      if (event.created_at) {
        const eventDate = event.created_at.split('T')[0]
        
        // Count different types of contribution events
        if (['PushEvent', 'CreateEvent', 'PullRequestEvent', 'IssuesEvent', 'IssueCommentEvent'].includes(event.type)) {
          const existing = contributionMap.get(eventDate) || { count: 0, level: 0 }
          existing.count += 1
          
          // Calculate level (0-4 scale)
          if (existing.count >= 10) existing.level = 4
          else if (existing.count >= 5) existing.level = 3
          else if (existing.count >= 3) existing.level = 2
          else if (existing.count >= 1) existing.level = 1
          
          contributionMap.set(eventDate, existing)
        }
      }
    })
    
    // Convert to weeks format
    return convertContributionMapToWeeks(contributionMap, oneYearAgo, now)
    
  } catch (error) {
    throw new Error(`Events API method failed: ${error.message}`)
  }
}

/**
 * Fetch contributions using GitHub's activity feed (more comprehensive)
 * @param {string} username - GitHub username
 * @returns {Promise<Array>} Contribution data
 */
const fetchContributionsFromActivity = async (username) => {
  try {
    // Use GitHub's atom feed which is publicly accessible
    const response = await fetch(`https://github.com/${username}.atom`, {
      headers: {
        'Accept': 'application/atom+xml, application/xml, text/xml'
      }
    })
    
    if (!response.ok) {
      throw new Error(`GitHub Atom feed error: ${response.status}`)
    }
    
    const xmlText = await response.text()
    console.log(`📰 Fetched activity feed for ${username}`)
    
    // Parse XML to extract contribution dates
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml')
    const entries = xmlDoc.querySelectorAll('entry')
    
    console.log(`📊 Found ${entries.length} activity entries`)
    
    // Process activity entries
    const now = new Date()
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
    const contributionMap = new Map()
    
    // Initialize map
    for (let d = new Date(oneYearAgo); d <= now; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0]
      contributionMap.set(dateStr, { count: 0, level: 0 })
    }
    
    // Process entries
    entries.forEach(entry => {
      const publishedElement = entry.querySelector('published')
      if (publishedElement) {
        const publishedDate = new Date(publishedElement.textContent).toISOString().split('T')[0]
        const existing = contributionMap.get(publishedDate) || { count: 0, level: 0 }
        existing.count += 1
        
        // Calculate level
        if (existing.count >= 8) existing.level = 4
        else if (existing.count >= 4) existing.level = 3
        else if (existing.count >= 2) existing.level = 2
        else if (existing.count >= 1) existing.level = 1
        
        contributionMap.set(publishedDate, existing)
      }
    })
    
    return convertContributionMapToWeeks(contributionMap, oneYearAgo, now)
    
  } catch (error) {
    throw new Error(`Activity feed method failed: ${error.message}`)
  }
}

/**
 * Fetch real contribution SVG directly from GitHub
 * @param {string} username - GitHub username
 * @returns {Promise<Array>} Contribution data
 */
const fetchRealContributionSVG = async (username) => {
  // Try specialized GitHub contribution APIs first
  try {
    console.log('📡 Trying GitHub Contributions API...')
    const response = await fetch(`https://github-contributions-api.jogruber.de/v4/${username}?y=last`)
    
    if (response.ok) {
      const contributionData = await response.json()
      console.log(`📊 GitHub Contributions API returned data:`, contributionData)
      
      if (contributionData.contributions) {
        return parseContributionAPIResponse(contributionData)
      }
    }
  } catch (error) {
    console.warn('❌ GitHub Contributions API failed:', error.message)
  }
  
  // Try GitHub's own SVG endpoint via CORS proxies
  const githubSvgProxies = [
    `https://api.allorigins.win/get?url=${encodeURIComponent(`https://github.com/users/${username}/contributions`)}`,
    `https://corsproxy.io/?https://github.com/users/${username}/contributions`,
    `https://cors-anywhere.herokuapp.com/https://github.com/users/${username}/contributions`
  ]
  
  // First try GitHub's actual contribution page
  for (const proxyUrl of githubSvgProxies) {
    try {
      console.log(`📡 Trying to fetch GitHub contributions via proxy...`)
      
      const response = await fetch(proxyUrl, {
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      })
      
      if (!response.ok) continue
      
      let html = await response.text()
      
      // Handle allorigins response format
      if (proxyUrl.includes('allorigins')) {
        try {
          const data = JSON.parse(html)
          html = data.contents
        } catch (e) {
          continue
        }
      }
      
      console.log(`📄 Fetched GitHub page (${html.length} characters)`)
      
      // Look for the contribution graph SVG in the HTML
      if (html.includes('js-calendar-graph') || html.includes('ContributionCalendar')) {
        const contributionData = parseGitHubContributionHTML(html)
        if (contributionData && contributionData.length > 0) {
          console.log(`✅ Successfully parsed real GitHub contribution data`)
          return contributionData
        }
      }
      
    } catch (error) {
      console.warn(`❌ Proxy ${proxyUrl.split('?')[0]} failed:`, error.message)
    }
  }
  
  throw new Error('Unable to fetch real GitHub contribution SVG')
}

/**
 * Parse response from GitHub Contributions API
 * @param {Object} apiData - API response data
 * @returns {Array} Parsed contribution data
 */
const parseContributionAPIResponse = (apiData) => {
  try {
    console.log('🔍 Parsing GitHub Contributions API response...')
    
    if (!apiData.contributions || !Array.isArray(apiData.contributions)) {
      throw new Error('Invalid API response format')
    }
    
    const contributionMap = new Map()
    
    // Parse contributions from API
    apiData.contributions.forEach(contribution => {
      const date = contribution.date
      const count = parseInt(contribution.count) || 0
      const level = Math.min(4, Math.max(0, contribution.level || Math.ceil(count / 2)))
      
      if (date) {
        contributionMap.set(date, {
          date,
          count,
          level
        })
      }
    })
    
    if (contributionMap.size === 0) {
      throw new Error('No contribution data found in API response')
    }
    
    const totalContributions = Array.from(contributionMap.values()).reduce((sum, c) => sum + c.count, 0)
    console.log(`📊 Parsed ${contributionMap.size} days, ${totalContributions} total contributions`)
    
    return convertContributionMapToWeeksFormat(contributionMap)
    
  } catch (error) {
    console.error('❌ Error parsing contribution API response:', error)
    throw error
  }
}

/**
 * Parse GitHub contribution HTML to extract real data
 * @param {string} html - HTML from GitHub contributions page
 * @returns {Array} Parsed contribution data
 */
const parseGitHubContributionHTML = (html) => {
  try {
    console.log('🔍 Parsing real GitHub contribution HTML...')
    
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    
    // Look for GitHub's contribution calendar elements
    const selectors = [
      '.ContributionCalendar-day[data-date][data-level]',
      'rect[data-date][data-level]',
      '.js-calendar-graph-svg rect[data-date]',
      'td.ContributionCalendar-day[data-date]',
      '[data-date][data-count]'
    ]
    
    let contributionElements = null
    
    for (const selector of selectors) {
      contributionElements = doc.querySelectorAll(selector)
      if (contributionElements.length > 0) {
        console.log(`✅ Found ${contributionElements.length} contribution elements with selector: ${selector}`)
        break
      }
    }
    
    if (!contributionElements || contributionElements.length === 0) {
      throw new Error('No GitHub contribution elements found in HTML')
    }
    
    const contributionMap = new Map()
    
    // Extract contribution data from elements
    Array.from(contributionElements).forEach(element => {
      const date = element.getAttribute('data-date')
      const level = parseInt(element.getAttribute('data-level') || '0')
      const count = parseInt(element.getAttribute('data-count') || level || '0')
      
      if (date) {
        contributionMap.set(date, {
          date,
          count: Math.max(count, level), // Use whichever is higher
          level: Math.min(4, Math.max(0, level))
        })
      }
    })
    
    if (contributionMap.size === 0) {
      throw new Error('No valid contribution data extracted')
    }
    
    // Convert to weeks format
    return convertContributionMapToWeeksFormat(contributionMap)
    
  } catch (error) {
    console.error('❌ Error parsing GitHub contribution HTML:', error)
    throw error
  }
}

/**
 * Convert contribution map to weeks format for animation
 * @param {Map} contributionMap - Map of date strings to contribution data
 * @returns {Array} Weeks array format
 */
const convertContributionMapToWeeksFormat = (contributionMap) => {
  // Get date range
  const dates = Array.from(contributionMap.keys()).sort()
  if (dates.length === 0) return []
  
  const startDate = new Date(dates[0])
  const endDate = new Date(dates[dates.length - 1])
  
  // Start from Sunday before the first date
  const firstSunday = new Date(startDate)
  firstSunday.setDate(startDate.getDate() - startDate.getDay())
  
  const weeks = []
  let currentWeek = []
  
  for (let d = new Date(firstSunday); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0]
    const contribution = contributionMap.get(dateStr) || { 
      date: dateStr, 
      count: 0, 
      level: 0 
    }
    
    currentWeek.push({
      ...contribution,
      weekIndex: weeks.length,
      dayIndex: currentWeek.length
    })
    
    // Complete week on Saturday
    if (d.getDay() === 6) {
      weeks.push(currentWeek)
      currentWeek = []
    }
  }
  
  // Add partial week if exists
  if (currentWeek.length > 0) {
    weeks.push(currentWeek)
  }
  
  console.log(`📅 Generated ${weeks.length} weeks from real GitHub data`)
  const totalContributions = weeks.flat().reduce((sum, day) => sum + day.count, 0)
  console.log(`📊 Total real contributions: ${totalContributions}`)
  
  return weeks
}

/**
 * Fetch contributions via a working CORS proxy
 * @param {string} username - GitHub username
 * @returns {Promise<Array>} Contribution data
 */
const fetchContributionsViaProxy = async (username) => {
  // Try multiple proxy services
  const proxyUrls = [
    `https://api.allorigins.win/get?url=${encodeURIComponent(`https://github.com/users/${username}/contributions`)}`,
    `https://corsproxy.io/?https://github.com/users/${username}/contributions`,
    `https://cors-anywhere.herokuapp.com/https://github.com/users/${username}/contributions`
  ]
  
  for (const proxyUrl of proxyUrls) {
    try {
      console.log(`📡 Trying proxy: ${proxyUrl.split('?')[0]}...`)
      
      const response = await fetch(proxyUrl, {
        headers: {
          'Accept': 'text/html,application/xhtml+xml'
        }
      })
      
      if (!response.ok) {
        console.warn(`❌ Proxy failed with status: ${response.status}`)
        continue
      }
      
      let html = await response.text()
      
      // Handle allorigins response format
      if (proxyUrl.includes('allorigins')) {
        const data = JSON.parse(html)
        html = data.contents
      }
      
      console.log(`📄 Fetched contribution page HTML (${html.length} characters)`)
      
      // Verify we got actual GitHub HTML
      if (!html.includes('contribution') && !html.includes('GitHub')) {
        console.warn('❌ Response doesn\'t appear to be GitHub contribution page')
        continue
      }
      
      // Parse the actual GitHub contribution graph
      const contributionData = parseContributionGraphFromHTML(html)
      if (contributionData && contributionData.length > 0) {
        console.log(`✅ Successfully parsed contribution data via proxy`)
        return contributionData
      }
      
    } catch (error) {
      console.warn(`❌ Proxy error: ${error.message}`)
      continue
    }
  }
  
  throw new Error('All CORS proxy methods failed')
}

/**
 * Fetch contributions based on repository activity
 * @param {string} username - GitHub username
 * @returns {Promise<Array>} Contribution data
 */
const fetchContributionsFromRepositories = async (username) => {
  try {
    // Fetch user's repositories
    const reposResponse = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`)
    
    if (!reposResponse.ok) {
      throw new Error(`Repositories API error: ${reposResponse.status}`)
    }
    
    const repos = await reposResponse.json()
    console.log(`📚 Found ${repos.length} repositories`)
    
    // Initialize contribution map
    const now = new Date()
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
    const contributionMap = new Map()
    
    for (let d = new Date(oneYearAgo); d <= now; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0]
      contributionMap.set(dateStr, { count: 0, level: 0 })
    }
    
    // Process repositories to estimate contribution activity
    for (const repo of repos.slice(0, 20)) { // Limit to first 20 repos to avoid rate limits
      try {
        // Get commits for this repository
        const commitsResponse = await fetch(
          `https://api.github.com/repos/${username}/${repo.name}/commits?author=${username}&since=${oneYearAgo.toISOString()}&per_page=100`
        )
        
        if (commitsResponse.ok) {
          const commits = await commitsResponse.json()
          console.log(`📝 Found ${commits.length} commits in ${repo.name}`)
          
          commits.forEach(commit => {
            if (commit.commit && commit.commit.author && commit.commit.author.date) {
              const commitDate = commit.commit.author.date.split('T')[0]
              const existing = contributionMap.get(commitDate) || { count: 0, level: 0 }
              existing.count += 1
              
              // Calculate level
              if (existing.count >= 20) existing.level = 4
              else if (existing.count >= 10) existing.level = 3
              else if (existing.count >= 5) existing.level = 2
              else if (existing.count >= 1) existing.level = 1
              
              contributionMap.set(commitDate, existing)
            }
          })
        }
        
        // Small delay to avoid hitting rate limits
        await new Promise(resolve => setTimeout(resolve, 100))
        
      } catch (error) {
        console.warn(`Failed to fetch commits for ${repo.name}:`, error.message)
      }
    }
    
    return convertContributionMapToWeeks(contributionMap, oneYearAgo, now)
    
  } catch (error) {
    throw new Error(`Repository-based method failed: ${error.message}`)
  }
}

/**
 * Convert contribution map to weeks format
 * @param {Map} contributionMap - Map of date strings to contribution data
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Array} Weeks array format
 */
const convertContributionMapToWeeks = (contributionMap, startDate, endDate) => {
  const weeks = []
  let currentWeek = []
  
  // Start from the beginning of the week containing startDate
  const firstSunday = new Date(startDate)
  firstSunday.setDate(startDate.getDate() - startDate.getDay())
  
  for (let d = new Date(firstSunday); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0]
    const contribution = contributionMap.get(dateStr) || { count: 0, level: 0 }
    
    currentWeek.push({
      date: dateStr,
      count: contribution.count,
      level: contribution.level,
      weekIndex: weeks.length,
      dayIndex: currentWeek.length
    })
    
    // Start new week every Sunday (day 0) or when we have 7 days
    if (d.getDay() === 6 || currentWeek.length === 7) {
      if (currentWeek.length === 7) {
        weeks.push(currentWeek)
        currentWeek = []
      }
    }
  }
  
  // Add any remaining days
  if (currentWeek.length > 0) {
    weeks.push(currentWeek)
  }
  
  console.log(`📅 Generated ${weeks.length} weeks of contribution data`)
  return weeks
}

/**
 * Generate realistic mock contribution data based on username patterns
 * @param {string} username - GitHub username
 * @returns {Array} Realistic mock contribution data
 */
const generateRealisticMockData = (username) => {
  // Create patterns based on username characteristics for demo
  const seed = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const rng = () => {
    const x = Math.sin(seed++) * 10000
    return x - Math.floor(x)
  }
  
  return generateMockContributionData(username, rng)
}

/**
 * Generate mock contribution data for demonstration
 * @param {string} username - GitHub username (optional)
 * @param {Function} rng - Random number generator (optional)
 * @returns {Array} Mock contribution data
 */
export const generateMockContributionData = (username = 'demo-user', rng = Math.random) => {
  const data = []
  const today = new Date()
  const startDate = new Date(today.getFullYear(), 0, 1) // Start of current year
  
  // Generate 53 weeks of data
  for (let week = 0; week < 53; week++) {
    const weekData = []
    
    for (let day = 0; day < 7; day++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + (week * 7) + day)
      
      // Generate realistic contribution patterns
      let contributionCount = 0
      const dayOfWeek = date.getDay()
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
      const monthProgress = (date.getMonth() + 1) / 12
      
      // Lower activity on weekends
      const weekendMultiplier = isWeekend ? 0.3 : 1
      
      // Seasonal variation (higher activity in fall/winter)
      const seasonalMultiplier = Math.sin((monthProgress * Math.PI * 2) - Math.PI/2) * 0.3 + 0.7
      
      // Random base activity
      const randomFactor = rng()
      
      if (randomFactor > 0.6) { // 40% chance of contributions
        contributionCount = Math.floor(
          (rng() * 15 + 1) * weekendMultiplier * seasonalMultiplier
        )
      }
      
      // Calculate contribution level (0-4 scale used by GitHub)
      let level = 0
      if (contributionCount > 0) {
        if (contributionCount >= 20) level = 4
        else if (contributionCount >= 10) level = 3
        else if (contributionCount >= 5) level = 2
        else level = 1
      }
      
      weekData.push({
        date: date.toISOString().split('T')[0],
        count: contributionCount,
        level: level,
        weekIndex: week,
        dayIndex: day
      })
    }
    
    data.push(weekData)
  }
  
  return data
}

/**
 * Get user's GitHub profile data
 * @param {string} username - GitHub username
 * @returns {Promise<Object>} User profile data
 */
export const fetchUserProfile = async (username) => {
  try {
    const response = await fetch(`${GITHUB_API_BASE}/users/${username}`)
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`)
    }
    
    const userData = await response.json()
    
    return {
      username: userData.login,
      name: userData.name,
      avatar: userData.avatar_url,
      bio: userData.bio,
      location: userData.location,
      company: userData.company,
      publicRepos: userData.public_repos,
      followers: userData.followers,
      following: userData.following,
      createdAt: userData.created_at,
      url: userData.html_url
    }
  } catch (error) {
    console.error('Error fetching user profile:', error)
    throw error
  }
}

/**
 * Validate GitHub username format
 * @param {string} username - Username to validate
 * @returns {boolean} Is valid username
 */
export const validateUsername = (username) => {
  // GitHub username rules:
  // - May only contain alphanumeric characters or single hyphens
  // - Cannot begin or end with a hyphen
  // - Maximum 39 characters
  const usernameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]){0,37}[a-zA-Z0-9]$|^[a-zA-Z0-9]$/
  return usernameRegex.test(username)
}

/**
 * Calculate contribution statistics
 * @param {Array} contributionData - Contribution data array
 * @returns {Object} Statistics object
 */
export const calculateContributionStats = (contributionData) => {
  let totalContributions = 0
  let activeWeeks = 0
  let maxDayContributions = 0
  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 0
  
  const allDays = contributionData.flat()
  
  allDays.forEach((day, index) => {
    totalContributions += day.count
    
    if (day.count > 0) {
      tempStreak++
      maxDayContributions = Math.max(maxDayContributions, day.count)
    } else {
      longestStreak = Math.max(longestStreak, tempStreak)
      tempStreak = 0
    }
  })
  
  // Count active weeks (weeks with at least one contribution)
  contributionData.forEach(week => {
    if (week.some(day => day.count > 0)) {
      activeWeeks++
    }
  })
  
  // Current streak is from the end
  for (let i = allDays.length - 1; i >= 0; i--) {
    if (allDays[i].count > 0) {
      currentStreak++
    } else {
      break
    }
  }
  
  longestStreak = Math.max(longestStreak, tempStreak)
  
  return {
    totalContributions,
    activeWeeks,
    maxDayContributions,
    currentStreak,
    longestStreak,
    averagePerWeek: Math.round(totalContributions / contributionData.length),
    weeklyActivity: (activeWeeks / contributionData.length) * 100
  }
}

/**
 * Format contribution data for different animation types
 * @param {Array} contributionData - Raw contribution data
 * @param {string} animationType - Type of animation ('sequential', 'random', 'chronological')
 * @returns {Array} Formatted data with animation order
 */
export const formatContributionDataForAnimation = (contributionData, animationType = 'sequential') => {
  const allCells = contributionData.flat().filter(day => day.count > 0)
  
  switch (animationType) {
    case 'random':
      return shuffleArray([...allCells])
    
    case 'chronological':
      return allCells.sort((a, b) => new Date(a.date) - new Date(b.date))
    
    case 'sequential':
    default:
      return allCells
  }
}

/**
 * Utility function to shuffle array
 * @param {Array} array - Array to shuffle
 * @returns {Array} Shuffled array
 */
const shuffleArray = (array) => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}