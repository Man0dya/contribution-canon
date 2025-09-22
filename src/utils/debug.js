/**
 * Debug utilities for testing GitHub API integration
 */

export const testGitHubAPI = async (username) => {
  console.log(`🧪 Testing GitHub API for username: ${username}`)
  
  try {
    // Test 1: Check if user exists
    console.log('📡 Testing user profile fetch...')
    const response = await fetch(`https://api.github.com/users/${username}`)
    
    if (response.ok) {
      const userData = await response.json()
      console.log('✅ User exists:', userData.login)
      console.log('📊 Public repos:', userData.public_repos)
      console.log('📅 Account created:', userData.created_at)
    } else {
      console.log('❌ User not found or API error:', response.status)
      return false
    }
    
    // Test 2: Try to fetch contribution data
    console.log('📈 Testing contribution data fetch...')
    const { fetchContributionData } = await import('./github.js')
    const contributionData = await fetchContributionData(username)
    
    console.log('✅ Contribution data fetched:', contributionData.length, 'weeks')
    
    // Calculate some stats
    const totalContributions = contributionData.flat().reduce((sum, day) => sum + day.count, 0)
    console.log('📈 Total contributions:', totalContributions)
    
    return contributionData
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    return false
  }
}

export const debugContributionFetch = (username) => {
  console.group(`🔍 Debugging contribution fetch for: ${username}`)
  
  const methods = [
    {
      name: 'Direct GitHub Profile',
      url: `https://github.com/${username}`,
      description: 'Direct access (will be blocked by CORS)'
    },
    {
      name: 'GitHub Contributions Endpoint',
      url: `https://github.com/users/${username}/contributions`,
      description: 'GitHub contributions calendar (will be blocked by CORS)'
    },
    {
      name: 'AllOrigins Proxy',
      url: `https://api.allorigins.win/get?url=https://github.com/users/${username}/contributions`,
      description: 'CORS proxy service'
    }
  ]
  
  methods.forEach(method => {
    console.log(`📡 ${method.name}:`)
    console.log(`   URL: ${method.url}`)
    console.log(`   Info: ${method.description}`)
  })
  
  console.groupEnd()
  
  // Test user existence first
  return testGitHubAPI(username)
}