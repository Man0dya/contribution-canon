import React, { useState } from 'react'

const TestPanel = ({ onTestComplete }) => {
  const [isTesting, setIsTesting] = useState(false)
  const [testResults, setTestResults] = useState([])

  const runTests = async () => {
    setIsTesting(true)
    setTestResults([])
    
    const testUsernames = ['octocat', 'torvalds', 'gaearon', 'nonexistentuser12345']
    
    for (const username of testUsernames) {
      try {
        console.log(`🧪 Testing ${username}...`)
        
        // Test user existence
        const userResponse = await fetch(`https://api.github.com/users/${username}`)
        const userExists = userResponse.ok
        
        if (userExists) {
          // Test our data fetching
          const { fetchContributionData } = await import('../utils/github.js')
          const data = await fetchContributionData(username)
          
          setTestResults(prev => [...prev, {
            username,
            status: 'success',
            message: `✅ Fetched ${data.length} weeks of real data`,
            data: data
          }])
        } else {
          setTestResults(prev => [...prev, {
            username,
            status: 'user-not-found',
            message: '❌ User does not exist',
            data: null
          }])
        }
        
      } catch (error) {
        setTestResults(prev => [...prev, {
          username,
          status: 'error',
          message: `❌ Error: ${error.message}`,
          data: null
        }])
      }
    }
    
    setIsTesting(false)
    if (onTestComplete) onTestComplete(testResults)
  }

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 p-4 rounded-lg border border-gray-700 max-w-sm">
      <h3 className="text-white font-semibold mb-2">🔧 Debug Panel</h3>
      
      <button
        onClick={runTests}
        disabled={isTesting}
        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm mb-2 disabled:opacity-50"
      >
        {isTesting ? 'Testing...' : 'Test API'}
      </button>
      
      {testResults.length > 0 && (
        <div className="space-y-1">
          {testResults.map((result, index) => (
            <div key={index} className="text-xs">
              <span className="text-gray-400">{result.username}:</span> 
              <span className={result.status === 'success' ? 'text-green-400' : 'text-red-400'}>
                {result.message}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default TestPanel