import React, { useState } from 'react'
import Header from './components/Header'
import UsernameForm from './components/UsernameForm'
import CodeGenerator from './components/CodeGenerator'
import Footer from './components/Footer'
import TestPanel from './components/TestPanel'

function App() {
  const [username, setUsername] = useState('')
  const [contributionData, setContributionData] = useState(null)
  const [animationKey, setAnimationKey] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isUsingMockData, setIsUsingMockData] = useState(false)

  const handleUsernameSubmit = async (submittedUsername) => {
    setUsername(submittedUsername)
    setIsLoading(true)
    setContributionData(null) // Clear previous data
    setError(null)
    setIsUsingMockData(false)
    
    try {
      // Debug mode: Log detailed information
      if (process.env.NODE_ENV === 'development') {
        console.log(`🚀 Fetching contribution data for: ${submittedUsername}`)
        
        // Import debug utilities
        const { debugContributionFetch } = await import('./utils/debug.js')
        debugContributionFetch(submittedUsername)
      }
      
      // Import the GitHub API function
      const { fetchContributionData } = await import('./utils/github.js')
      
      // Fetch real GitHub contribution data
      const realData = await fetchContributionData(submittedUsername)
      setContributionData(realData)
      setIsUsingMockData(false)
      setAnimationKey(prev => prev + 1) // Trigger animation restart
      
      console.log(`✅ Successfully loaded real data for ${submittedUsername}`)
      
    } catch (error) {
      console.error('❌ Error fetching contribution data:', error.message)
      
      // Set error state for user feedback - NO MORE MOCK DATA FALLBACK
      setError({
        message: `Unable to fetch real GitHub contribution data for "${submittedUsername}"`,
        reasons: [
          error.message.includes('Invalid') ? 'Invalid GitHub username format' : null,
          error.message.includes('404') ? 'GitHub user does not exist' : null,
          error.message.includes('rate limit') ? 'GitHub API rate limit reached' : null,
          error.message.includes('network') || error.message.includes('fetch') ? 'Network connectivity issues' : null,
          error.message.includes('CORS') ? 'GitHub blocks cross-origin requests' : null,
          error.message.includes('publicly accessible') ? 'GitHub contribution data requires special access' : null,
          'Real contribution data could not be retrieved'
        ].filter(Boolean),
        suggestion: `GitHub's contribution graph is private and not accessible via public APIs. Try a different username or check back later when we improve data access methods.`
      })
      
      // Clear any existing data - NO MOCK DATA
      setContributionData(null)
      setIsUsingMockData(false)
    } finally {
      setIsLoading(false)
    }
  }



  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Main content */}
      <div className="relative">
        <main className="container mx-auto px-4 py-8 space-y-8">
          <UsernameForm 
            onSubmit={handleUsernameSubmit}
            isLoading={isLoading}
          />
          
          {error && (
            <div className="max-w-4xl mx-auto mb-8">
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">⚠️</div>
                  <div className="flex-1">
                    <h3 className="text-yellow-800 font-semibold text-lg mb-2">
                      {error.message}
                    </h3>
                    <ul className="text-yellow-700 text-sm space-y-1 mb-3 list-disc list-inside">
                      {error.reasons.map((reason, index) => (
                        <li key={index}>{reason}</li>
                      ))}
                    </ul>
                    <p className="text-yellow-600 text-sm italic">
                      {error.suggestion}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {contributionData && (
            <div className="space-y-6">
              <CodeGenerator 
                username={username}
                contributionData={contributionData}
                isUsingMockData={isUsingMockData}
              />
            </div>
          )}
        </main>
        
        <Footer />
        
        {/* Debug panel - only shows in development */}
        <TestPanel />
      </div>
    </div>
  )
}

export default App