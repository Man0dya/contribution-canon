"""
Flask web application for GitHub Contribution Canon.
Serves animated SVGs of canons shooting at GitHub contribution graphs.
"""
from flask import Flask, request, Response, render_template, jsonify
import os
from dotenv import load_dotenv
import time
from typing import Dict, Optional
import logging
from functools import wraps

# Import our modules
from src.github_fetcher import GitHubContributionFetcher
from src.animation_generator import CanonAnimationGenerator

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize our services
github_fetcher = GitHubContributionFetcher()
animation_generator = CanonAnimationGenerator()

# Simple in-memory cache (for production, use Redis or similar)
cache = {}
CACHE_TIMEOUT = int(os.getenv('CACHE_TIMEOUT', 3600))  # 1 hour default


def cache_response(timeout: int = CACHE_TIMEOUT):
    """Decorator to cache responses."""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Create cache key from function name and arguments
            cache_key = f"{f.__name__}:{':'.join(map(str, args))}:{':'.join(f'{k}={v}' for k, v in kwargs.items())}"
            
            # Check if we have a cached response
            if cache_key in cache:
                cached_data, timestamp = cache[cache_key]
                if time.time() - timestamp < timeout:
                    logger.info(f"Cache hit for {cache_key}")
                    return cached_data
                else:
                    # Remove expired cache entry
                    del cache[cache_key]
            
            # Generate new response
            result = f(*args, **kwargs)
            
            # Cache the result
            cache[cache_key] = (result, time.time())
            logger.info(f"Cached response for {cache_key}")
            
            return result
        return decorated_function
    return decorator


@app.route('/')
def index():
    """Home page with usage instructions."""
    return render_template('index.html')


@app.route('/health')
def health_check():
    """Health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'timestamp': time.time(),
        'cache_size': len(cache)
    })


@app.route('/demo')
def demo_animation():
    """Generate a demo animation with fake contribution data."""
    try:
        # Create fake contribution data for demo
        demo_grid = []
        for week in range(53):  # Full year
            week_data = []
            for day in range(7):
                # Create some random-looking contributions
                if (week + day) % 3 == 0 and week % 2 == 0:
                    count = min(15, (week // 4) + (day * 2))
                    level = min(4, count // 3) if count > 0 else 0
                else:
                    count = 0
                    level = 0
                
                week_data.append({
                    'date': f'2024-{(week//4)+1:02d}-{day+1:02d}',
                    'count': count,
                    'level': level
                })
            demo_grid.append(week_data)
        
        demo_metadata = {
            'username': 'demo-user',
            'total_contributions': sum(day['count'] for week in demo_grid for day in week),
            'max_contributions': max((day['count'] for week in demo_grid for day in week), default=0)
        }
        
        # Get query parameters
        theme = request.args.get('theme', 'light').lower()
        speed = request.args.get('speed', 'normal').lower()
        canon_style = request.args.get('canon', 'classic').lower()
        
        # Generate animation
        svg_content = animation_generator.generate_animation(
            contribution_grid=demo_grid,
            metadata=demo_metadata,
            theme=theme,
            speed=speed,
            canon_style=canon_style
        )
        
        # Return SVG
        response = Response(svg_content, mimetype='image/svg+xml')
        response.headers['Cache-Control'] = 'no-cache'  # Don't cache demo
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET'
        
        return response
        
    except Exception as e:
        logger.error(f"Error generating demo animation: {str(e)}")
        return generate_error_svg("Error generating demo animation")

@app.route('/<username>')
@cache_response()
def generate_contribution_canon(username: str):
    """
    Generate animated SVG for a GitHub user's contributions.
    
    Query parameters:
    - theme: light (default), dark, neon, retro
    - speed: slow, normal (default), fast
    - canon: classic (default), tank, spaceship
    - color: custom hex color (overrides theme)
    """
    try:
        # Get query parameters
        theme = request.args.get('theme', 'light').lower()
        speed = request.args.get('speed', 'normal').lower()
        canon_style = request.args.get('canon', 'classic').lower()
        custom_color = request.args.get('color')
        
        # Validate parameters
        if theme not in ['light', 'dark', 'neon', 'retro']:
            theme = 'light'
        if speed not in ['slow', 'normal', 'fast']:
            speed = 'normal'
        if canon_style not in ['classic', 'tank', 'spaceship']:
            canon_style = 'classic'
        
        logger.info(f"Generating animation for {username} with theme={theme}, speed={speed}, canon={canon_style}")
        
        # Fetch contribution data
        contribution_grid, metadata = github_fetcher.get_contribution_grid(username)
        
        if not contribution_grid:
            return generate_error_svg(f"No contribution data found for user '{username}'")
        
        # Generate animation
        svg_content = animation_generator.generate_animation(
            contribution_grid=contribution_grid,
            metadata=metadata,
            theme=theme,
            speed=speed,
            canon_style=canon_style
        )
        
        # Apply custom color if provided
        if custom_color:
            svg_content = apply_custom_color(svg_content, custom_color)
        
        # Return SVG with proper headers
        response = Response(svg_content, mimetype='image/svg+xml')
        response.headers['Cache-Control'] = f'public, max-age={CACHE_TIMEOUT}'
        response.headers['Content-Disposition'] = f'inline; filename="{username}-contribution-canon.svg"'
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET'
        
        return response
        
    except Exception as e:
        logger.error(f"Error generating animation for {username}: {str(e)}")
        return generate_error_svg(f"Error: {str(e)}")


@app.route('/preview/<username>')
def preview_animation(username: str):
    """Preview page showing the animation with customization options."""
    return render_template('preview.html', username=username)


@app.route('/api/user/<username>/stats')
@cache_response(timeout=1800)  # Cache for 30 minutes
def get_user_stats(username: str):
    """Get user contribution statistics as JSON."""
    try:
        contribution_grid, metadata = github_fetcher.get_contribution_grid(username)
        
        return jsonify({
            'username': metadata['username'],
            'total_contributions': metadata['total_contributions'],
            'max_contributions': metadata['max_contributions'],
            'weeks_count': metadata['weeks_count'],
            'total_days': sum(len(week) for week in contribution_grid),
            'active_days': sum(1 for week in contribution_grid for day in week if day['count'] > 0),
            'longest_streak': calculate_longest_streak(contribution_grid),
            'current_streak': calculate_current_streak(contribution_grid)
        })
        
    except Exception as e:
        logger.error(f"Error fetching stats for {username}: {str(e)}")
        return jsonify({'error': str(e)}), 500


def generate_error_svg(message: str) -> Response:
    """Generate an error SVG with a message."""
    error_svg = f'''
    <svg width="800" height="200" xmlns="http://www.w3.org/2000/svg" style="background-color: #f8f8f8;">
        <text x="50" y="50" font-family="Arial, sans-serif" font-size="16" fill="#d73a49">
            ❌ Error: {message}
        </text>
        <text x="50" y="80" font-family="Arial, sans-serif" font-size="12" fill="#586069">
            Please check the username and try again.
        </text>
        <text x="50" y="100" font-family="Arial, sans-serif" font-size="12" fill="#586069">
            Make sure the GitHub profile is public.
        </text>
    </svg>
    '''
    
    response = Response(error_svg, mimetype='image/svg+xml')
    response.status_code = 400
    return response


def apply_custom_color(svg_content: str, hex_color: str) -> str:
    """Apply custom color to SVG content."""
    # Validate hex color
    if not hex_color.startswith('#'):
        hex_color = '#' + hex_color
    
    if len(hex_color) != 7:
        return svg_content  # Invalid color, return original
    
    try:
        int(hex_color[1:], 16)  # Validate hex format
    except ValueError:
        return svg_content  # Invalid color, return original
    
    # Replace canon color with custom color
    # This is a simple replacement - in production you might want more sophisticated color handling
    svg_content = svg_content.replace('class="canon-body"', f'class="canon-body" style="fill: {hex_color};"')
    
    return svg_content


def calculate_longest_streak(contribution_grid: list) -> int:
    """Calculate the longest contribution streak."""
    longest = current = 0
    
    for week in contribution_grid:
        for day in week:
            if day['count'] > 0:
                current += 1
                longest = max(longest, current)
            else:
                current = 0
    
    return longest


def calculate_current_streak(contribution_grid: list) -> int:
    """Calculate current contribution streak (from most recent day)."""
    # Flatten grid and reverse to start from most recent
    all_days = []
    for week in contribution_grid:
        all_days.extend(week)
    
    all_days.reverse()
    
    streak = 0
    for day in all_days:
        if day['count'] > 0:
            streak += 1
        else:
            break
    
    return streak


@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors."""
    return jsonify({'error': 'Endpoint not found'}), 404


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors."""
    logger.error(f"Internal server error: {str(error)}")
    return jsonify({'error': 'Internal server error'}), 500


@app.route('/test')
def test_svg():
    """Test page for debugging SVG animations."""
    return """<!DOCTYPE html>
<html>
<head>
    <title>SVG Animation Test</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 20px;
            background: #f0f0f0;
        }
        .test-container {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .svg-container {
            border: 2px solid #ccc;
            padding: 10px;
            margin: 10px 0;
            background: white;
            min-height: 200px;
        }
        .status {
            padding: 10px;
            margin: 5px 0;
            border-radius: 4px;
            font-weight: bold;
        }
        .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        .info { background: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb; }
    </style>
</head>
<body>
    <h1>🧪 SVG Animation Test</h1>
    
    <div class="test-container">
        <h2>Test 1: Direct SVG from Demo Endpoint</h2>
        <div id="status1" class="status info">Initializing...</div>
        <div id="direct-svg" class="svg-container">
            <p>Loading SVG...</p>
        </div>
        <button onclick="loadDirectSVG()">Reload Direct SVG</button>
    </div>
    
    <div class="test-container">
        <h2>Test 2: SVG via IMG tag (won't animate)</h2>
        <div class="status info">IMG tags don't support SVG animations</div>
        <div class="svg-container">
            <img src="/demo" alt="Demo animation" style="max-width: 100%;" />
        </div>
    </div>
    
    <div class="test-container">
        <h2>Test 3: Real User SVG (chin00kz)</h2>
        <div id="status3" class="status info">Ready to load...</div>
        <div id="user-svg" class="svg-container">
            <p>Click button to load user SVG...</p>
        </div>
        <button onclick="loadUserSVG()">Load User SVG</button>
    </div>

    <script>
        function updateStatus(id, message, type = 'info') {
            const statusEl = document.getElementById(id);
            statusEl.textContent = message;
            statusEl.className = `status ${type}`;
        }
        
        function loadDirectSVG() {
            const container = document.getElementById('direct-svg');
            container.innerHTML = '<p>⏳ Loading demo SVG...</p>';
            updateStatus('status1', 'Fetching SVG from /demo endpoint...', 'info');
            
            fetch('/demo')
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }
                    return response.text();
                })
                .then(svgContent => {
                    container.innerHTML = svgContent;
                    const animCount = (svgContent.match(/animate/g) || []).length;
                    const circleCount = (svgContent.match(/<circle/g) || []).length;
                    updateStatus('status1', `✅ Success! SVG loaded (${svgContent.length} chars, ${animCount} animations, ${circleCount} circles)`, 'success');
                    console.log('Demo SVG loaded successfully!');
                })
                .catch(error => {
                    container.innerHTML = `<p>❌ Error: ${error.message}</p>`;
                    updateStatus('status1', `❌ Failed: ${error.message}`, 'error');
                    console.error('Error loading demo SVG:', error);
                });
        }
        
        function loadUserSVG() {
            const container = document.getElementById('user-svg');
            container.innerHTML = '<p>⏳ Loading user SVG...</p>';
            updateStatus('status3', 'Fetching SVG from /chin00kz endpoint...', 'info');
            
            fetch('/chin00kz')
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }
                    return response.text();
                })
                .then(svgContent => {
                    container.innerHTML = svgContent;
                    const animCount = (svgContent.match(/animate/g) || []).length;
                    const circleCount = (svgContent.match(/<circle/g) || []).length;
                    updateStatus('status3', `✅ Success! User SVG loaded (${svgContent.length} chars, ${animCount} animations, ${circleCount} circles)`, 'success');
                    console.log('User SVG loaded successfully!');
                })
                .catch(error => {
                    container.innerHTML = `<p>❌ Error: ${error.message}</p>`;
                    updateStatus('status3', `❌ Failed: ${error.message}`, 'error');
                    console.error('Error loading user SVG:', error);
                });
        }
        
        // Auto-load demo on page load
        window.addEventListener('load', function() {
            setTimeout(loadDirectSVG, 1000);
        });
        
        console.log('Test page loaded. Check console for SVG loading messages.');
    </script>
</body>
</html>"""


if __name__ == '__main__':
    # Production and development server
    debug_mode = os.getenv('DEBUG', 'True').lower() == 'true'  # Default True for local dev
    port = int(os.getenv('PORT', 5001))  # Railway/Render will set PORT automatically
    
    logger.info(f"Starting Contribution Canon server on port {port}")
    logger.info(f"Debug mode: {debug_mode}")
    logger.info(f"Environment: {'Development' if debug_mode else 'Production'}")
    
    app.run(host='0.0.0.0', port=port, debug=debug_mode)