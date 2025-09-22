// Test GitHub API directly
console.log('🚀 Testing GitHub API...')

// Test with a known GitHub user (like 'octocat' - GitHub's mascot account)
const testUsername = 'octocat'

// Test 1: Check if user exists
fetch(`https://api.github.com/users/${testUsername}`)
  .then(response => {
    console.log(`User API Status: ${response.status}`)
    return response.json()
  })
  .then(data => {
    console.log(`✅ User exists: ${data.login} with ${data.public_repos} public repos`)
    
    // Test 2: Check events API
    return fetch(`https://api.github.com/users/${testUsername}/events/public?per_page=10`)
  })
  .then(response => {
    console.log(`Events API Status: ${response.status}`)
    return response.json()
  })
  .then(events => {
    console.log(`📊 Found ${events.length} events`)
    events.forEach((event, i) => {
      if (i < 3) { // Show first 3 events
        console.log(`Event ${i + 1}: ${event.type} on ${event.created_at}`)
      }
    })
    
    // Test 3: Check contribution data parsing
    const contributionMap = new Map()
    const now = new Date()
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
    
    // Initialize map
    for (let d = new Date(oneYearAgo); d <= now; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0]
      contributionMap.set(dateStr, { count: 0, level: 0 })
    }
    
    // Process events
    events.forEach(event => {
      if (event.created_at) {
        const eventDate = event.created_at.split('T')[0]
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
    
    // Count non-zero contributions
    let contributionDays = 0
    contributionMap.forEach(value => {
      if (value.count > 0) contributionDays++
    })
    
    console.log(`🎯 Found ${contributionDays} days with contributions from events`)
    
    // Convert to weeks format for testing
    const weeks = []
    let currentWeek = []
    
    const firstSunday = new Date(oneYearAgo)
    firstSunday.setDate(oneYearAgo.getDate() - oneYearAgo.getDay())
    
    for (let d = new Date(firstSunday); d <= now; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0]
      const contribution = contributionMap.get(dateStr) || { count: 0, level: 0 }
      
      currentWeek.push({
        date: dateStr,
        count: contribution.count,
        level: contribution.level,
        weekIndex: weeks.length,
        dayIndex: currentWeek.length
      })
      
      if (d.getDay() === 6 || currentWeek.length === 7) {
        if (currentWeek.length === 7) {
          weeks.push(currentWeek)
          currentWeek = []
        }
      }
    }
    
    if (currentWeek.length > 0) {
      weeks.push(currentWeek)
    }
    
    console.log(`📅 Generated ${weeks.length} weeks of data`)
    
    // Count weeks with contributions
    const activeWeeks = weeks.filter(week => week.some(day => day.count > 0))
    console.log(`📊 ${activeWeeks.length} weeks have contributions`)
    
    // Show sample data
    console.log('Sample week data:')
    if (activeWeeks.length > 0) {
      console.log(activeWeeks[0])
    }
    
  })
  .catch(error => {
    console.error('❌ Test failed:', error)
  })