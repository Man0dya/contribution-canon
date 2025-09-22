import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Loader2, Github, ArrowRight } from 'lucide-react'

const UsernameForm = ({ onSubmit, isLoading }) => {
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!username.trim()) {
      setError('Please enter a GitHub username')
      return
    }
    
    // Basic GitHub username validation
    const usernameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9]|-)*[a-zA-Z0-9]$|^[a-zA-Z0-9]$/
    if (!usernameRegex.test(username)) {
      setError('Please enter a valid GitHub username')
      return
    }
    
    setError('')
    onSubmit(username)
  }

  const handleUsernameChange = (e) => {
    setUsername(e.target.value)
    if (error) setError('') // Clear error when user starts typing
  }

  return (
    <section id="username-form" className="bg-white py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Enter GitHub Username
          </h2>

          <div className="card">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Github className="h-5 w-5 text-gray-400" />
                </div>
                
                <input
                  type="text"
                  value={username}
                  onChange={handleUsernameChange}
                  placeholder="Enter GitHub username"
                  className="input-field pl-10"
                  disabled={isLoading}
                />
                
                {username && !error && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                )}
              </div>

              {/* Error message */}
              {error && (
                <div className="text-red-600 text-sm flex items-center space-x-2">
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading || !username.trim()}
                className={`w-full btn-primary flex items-center justify-center space-x-2 ${
                  isLoading || !username.trim() 
                    ? 'opacity-50 cursor-not-allowed' 
                    : ''
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    <span>Generate Animation</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Example usernames */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-2">Try these examples:</p>
              <div className="flex flex-wrap gap-2">
                {['torvalds', 'gaearon', 'sindresorhus', 'addyosmani', 'octocat', 'github'].map((exampleUsername) => (
                  <button
                    key={exampleUsername}
                    onClick={() => {
                      setUsername(exampleUsername)
                      setError('')
                    }}
                    className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm text-gray-600 transition-colors"
                    disabled={isLoading}
                  >
                    {exampleUsername}
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

export default UsernameForm