"""
SVG Animation Generator for GitHub Contribution Canon.
Creates animated SVGs showing a canon shooting at contribution squares.
"""
import math
from typing import List, Dict, Tuple, Optional
from datetime import datetime, timedelta


class CanonAnimationGenerator:
    """Generates animated SVG of a canon shooting at GitHub contribution graph."""
    
    def __init__(self, width: int = 800, height: int = 200):
        self.width = width
        self.height = height
        self.cell_size = 10
        self.cell_gap = 2
        self.canon_size = 20
        self.animation_duration = 30  # seconds
        self.fps = 10  # frames per second for smooth animation
        
    def generate_animation(self, contribution_grid: List[List[Dict]], 
                         metadata: Dict, theme: str = 'light', 
                         speed: str = 'normal', canon_style: str = 'classic') -> str:
        """Generate complete animated SVG."""
        
        # Calculate grid dimensions
        weeks_count = len(contribution_grid)
        days_count = 7
        
        # Adjust canvas size based on content
        grid_width = weeks_count * (self.cell_size + self.cell_gap)
        grid_height = days_count * (self.cell_size + self.cell_gap)
        
        # Calculate positions
        grid_start_x = 50
        grid_start_y = 50
        canon_start_x = 20
        canon_y = grid_start_y + grid_height // 2
        
        # Get theme colors
        colors = self._get_theme_colors(theme)
        
        # Generate SVG
        svg_parts = []
        
        # SVG header
        svg_parts.append(f'''<svg width="{self.width}" height="{self.height}" 
                            xmlns="http://www.w3.org/2000/svg" 
                            style="background-color: {colors['background']};">''')
        
        # Add styles
        svg_parts.append(self._generate_styles(colors))
        
        # Add title
        svg_parts.append(f'''
        <text x="10" y="25" class="title">
            {metadata['username']}'s Contribution Canon
        </text>
        <text x="10" y="40" class="subtitle">
            {metadata['total_contributions']} contributions destroyed!
        </text>
        ''')
        
        # Generate contribution grid
        svg_parts.append(self._generate_contribution_grid(
            contribution_grid, grid_start_x, grid_start_y, colors
        ))
        
        # Generate canon animation
        svg_parts.append(self._generate_canon_animation(
            canon_start_x, canon_y, canon_style, colors, contribution_grid
        ))
        
        # Generate bullet animations
        svg_parts.append(self._generate_bullet_animations(
            canon_start_x, canon_y, grid_start_x, grid_start_y,
            contribution_grid, colors, speed
        ))
        
        # Add explosion effects
        svg_parts.append(self._generate_explosion_effects(
            grid_start_x, grid_start_y, contribution_grid, colors
        ))
        
        svg_parts.append('</svg>')
        
        return '\n'.join(svg_parts)
    
    def _get_theme_colors(self, theme: str) -> Dict[str, str]:
        """Get color scheme for different themes."""
        themes = {
            'light': {
                'background': '#ffffff',
                'text': '#24292e',
                'canon': '#586069',
                'bullet': '#f9826c',
                'explosion': '#ffdf5d',
                'grid_bg': '#ebedf0',
                'levels': ['#ebedf0', '#c6e48b', '#7bc96f', '#239a3b', '#196127']
            },
            'dark': {
                'background': '#0d1117',
                'text': '#c9d1d9',
                'canon': '#8b949e',
                'bullet': '#f85149',
                'explosion': '#ffd700',
                'grid_bg': '#21262d',
                'levels': ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353']
            },
            'neon': {
                'background': '#000000',
                'text': '#00ff00',
                'canon': '#ff00ff',
                'bullet': '#00ffff',
                'explosion': '#ffff00',
                'grid_bg': '#111111',
                'levels': ['#111111', '#003300', '#006600', '#009900', '#00cc00']
            },
            'retro': {
                'background': '#2e2e2e',
                'text': '#f0f0f0',
                'canon': '#d2691e',
                'bullet': '#ff6347',
                'explosion': '#ffd700',
                'grid_bg': '#404040',
                'levels': ['#404040', '#8b4513', '#a0522d', '#cd853f', '#daa520']
            }
        }
        return themes.get(theme, themes['light'])
    
    def _generate_styles(self, colors: Dict[str, str]) -> str:
        """Generate CSS styles for the SVG."""
        return f'''
        <defs>
            <style type="text/css">
                .title {{ font-family: Arial, sans-serif; font-size: 14px; font-weight: bold; fill: {colors['text']}; }}
                .subtitle {{ font-family: Arial, sans-serif; font-size: 12px; fill: {colors['text']}; opacity: 0.8; }}
                .contribution-cell {{ stroke: none; }}
                .canon-body {{ fill: {colors['canon']}; }}
                .bullet {{ fill: {colors['bullet']}; }}
                .explosion {{ fill: {colors['explosion']}; opacity: 0.8; }}
            </style>
            
            <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge> 
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
        </defs>
        '''
    
    def _generate_contribution_grid(self, grid: List[List[Dict]], 
                                  start_x: int, start_y: int, 
                                  colors: Dict[str, str]) -> str:
        """Generate the contribution grid SVG elements."""
        grid_svg = ['<g id="contribution-grid">']
        
        for week_idx, week in enumerate(grid):
            for day_idx, day in enumerate(week):
                x = start_x + week_idx * (self.cell_size + self.cell_gap)
                y = start_y + day_idx * (self.cell_size + self.cell_gap)
                
                level = day.get('level', 0)
                color = colors['levels'][min(level, 4)]
                
                # Add unique ID for targeting by bullets
                cell_id = f"cell-{week_idx}-{day_idx}"
                
                grid_svg.append(f'''
                <rect id="{cell_id}" 
                      x="{x}" y="{y}" 
                      width="{self.cell_size}" height="{self.cell_size}"
                      fill="{color}" 
                      class="contribution-cell"
                      data-count="{day.get('count', 0)}"
                      data-level="{level}">
                    <title>{day.get('date', '')}: {day.get('count', 0)} contributions</title>
                </rect>
                ''')
        
        grid_svg.append('</g>')
        return '\n'.join(grid_svg)
    
    def _generate_canon_animation(self, start_x: int, y: int, 
                                canon_style: str, colors: Dict[str, str],
                                grid: List[List[Dict]]) -> str:
        """Generate the animated canon."""
        canon_svg = ['<g id="canon">']
        
        # Calculate total distance to travel
        end_x = start_x + len(grid) * (self.cell_size + self.cell_gap) + 50
        
        if canon_style == 'tank':
            canon_svg.append(self._generate_tank_canon(start_x, y, end_x, colors))
        elif canon_style == 'spaceship':
            canon_svg.append(self._generate_spaceship_canon(start_x, y, end_x, colors))
        else:  # classic
            canon_svg.append(self._generate_classic_canon(start_x, y, end_x, colors))
        
        canon_svg.append('</g>')
        return '\n'.join(canon_svg)
    
    def _generate_classic_canon(self, start_x: int, y: int, end_x: int, 
                              colors: Dict[str, str]) -> str:
        """Generate classic canon design."""
        return f'''
        <g class="canon-body">
            <!-- Canon base (wheels) -->
            <circle cx="{start_x + 5}" cy="{y + 10}" r="3" fill="{colors['canon']}">
                <animateTransform attributeName="transform" type="translate"
                    values="0,0; {end_x - start_x},0" 
                    dur="{self.animation_duration}s" 
                    repeatCount="indefinite"/>
            </circle>
            <circle cx="{start_x + 15}" cy="{y + 10}" r="3" fill="{colors['canon']}">
                <animateTransform attributeName="transform" type="translate"
                    values="0,0; {end_x - start_x},0" 
                    dur="{self.animation_duration}s" 
                    repeatCount="indefinite"/>
            </circle>
            
            <!-- Canon body -->
            <rect x="{start_x}" y="{y}" width="20" height="8" rx="2" fill="{colors['canon']}">
                <animateTransform attributeName="transform" type="translate"
                    values="0,0; {end_x - start_x},0" 
                    dur="{self.animation_duration}s" 
                    repeatCount="indefinite"/>
            </rect>
            
            <!-- Canon barrel -->
            <rect x="{start_x + 20}" y="{y + 2}" width="15" height="4" fill="{colors['canon']}">
                <animateTransform attributeName="transform" type="translate"
                    values="0,0; {end_x - start_x},0" 
                    dur="{self.animation_duration}s" 
                    repeatCount="indefinite"/>
            </rect>
        </g>
        '''
    
    def _generate_tank_canon(self, start_x: int, y: int, end_x: int, 
                           colors: Dict[str, str]) -> str:
        """Generate tank-style canon design."""
        return f'''
        <g class="canon-body">
            <!-- Tank treads -->
            <rect x="{start_x - 2}" y="{y + 8}" width="24" height="6" rx="3" fill="{colors['canon']}" opacity="0.8">
                <animateTransform attributeName="transform" type="translate"
                    values="0,0; {end_x - start_x},0" 
                    dur="{self.animation_duration}s" 
                    repeatCount="indefinite"/>
            </rect>
            
            <!-- Tank body -->
            <rect x="{start_x}" y="{y - 2}" width="20" height="12" rx="3" fill="{colors['canon']}">
                <animateTransform attributeName="transform" type="translate"
                    values="0,0; {end_x - start_x},0" 
                    dur="{self.animation_duration}s" 
                    repeatCount="indefinite"/>
            </rect>
            
            <!-- Tank turret -->
            <circle cx="{start_x + 10}" cy="{y + 2}" r="6" fill="{colors['canon']}">
                <animateTransform attributeName="transform" type="translate"
                    values="0,0; {end_x - start_x},0" 
                    dur="{self.animation_duration}s" 
                    repeatCount="indefinite"/>
            </circle>
            
            <!-- Tank barrel -->
            <rect x="{start_x + 16}" y="{y + 1}" width="18" height="2" fill="{colors['canon']}">
                <animateTransform attributeName="transform" type="translate"
                    values="0,0; {end_x - start_x},0" 
                    dur="{self.animation_duration}s" 
                    repeatCount="indefinite"/>
            </rect>
        </g>
        '''
    
    def _generate_spaceship_canon(self, start_x: int, y: int, end_x: int, 
                                colors: Dict[str, str]) -> str:
        """Generate spaceship-style canon design."""
        return f'''
        <g class="canon-body">
            <!-- Spaceship body -->
            <polygon points="{start_x},{y + 8} {start_x + 25},{y + 4} {start_x + 25},{y - 4} {start_x},{y - 8}" 
                     fill="{colors['canon']}">
                <animateTransform attributeName="transform" type="translate"
                    values="0,0; {end_x - start_x},0" 
                    dur="{self.animation_duration}s" 
                    repeatCount="indefinite"/>
            </polygon>
            
            <!-- Spaceship engines -->
            <circle cx="{start_x + 2}" cy="{y + 4}" r="2" fill="{colors['bullet']}" opacity="0.7">
                <animateTransform attributeName="transform" type="translate"
                    values="0,0; {end_x - start_x},0" 
                    dur="{self.animation_duration}s" 
                    repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.3;1;0.3" dur="0.5s" repeatCount="indefinite"/>
            </circle>
            <circle cx="{start_x + 2}" cy="{y - 4}" r="2" fill="{colors['bullet']}" opacity="0.7">
                <animateTransform attributeName="transform" type="translate"
                    values="0,0; {end_x - start_x},0" 
                    dur="{self.animation_duration}s" 
                    repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.3;1;0.3" dur="0.5s" repeatCount="indefinite"/>
            </circle>
        </g>
        '''
    
    def _generate_bullet_animations(self, canon_x: int, canon_y: int,
                                  grid_x: int, grid_y: int,
                                  grid: List[List[Dict]], colors: Dict[str, str],
                                  speed: str) -> str:
        """Generate bullet animations targeting contribution cells."""
        bullets_svg = ['<g id="bullets">']
        
        # Calculate speed multiplier
        speed_multiplier = {'slow': 1.5, 'normal': 1.0, 'fast': 0.7}.get(speed, 1.0)
        
        # Generate bullets for cells with contributions
        bullet_delay = 0
        
        for week_idx, week in enumerate(grid):
            for day_idx, day in enumerate(week):
                if day.get('count', 0) > 0:  # Only shoot at cells with contributions
                    target_x = grid_x + week_idx * (self.cell_size + self.cell_gap) + self.cell_size // 2
                    target_y = grid_y + day_idx * (self.cell_size + self.cell_gap) + self.cell_size // 2
                    
                    # Calculate bullet trajectory
                    distance = math.sqrt((target_x - canon_x) ** 2 + (target_y - canon_y) ** 2)
                    bullet_duration = (distance / 100) * speed_multiplier  # Adjust speed
                    
                    bullets_svg.append(f'''
                    <circle r="2" fill="{colors['bullet']}" filter="url(#glow)">
                        <animateTransform attributeName="transform" type="translate"
                            values="{canon_x + 35},{canon_y}; {target_x},{target_y}"
                            dur="{bullet_duration}s"
                            begin="{bullet_delay}s"
                            fill="freeze"/>
                        <animate attributeName="opacity"
                            values="1; 1; 0"
                            dur="{bullet_duration + 0.1}s"
                            begin="{bullet_delay}s"
                            fill="freeze"/>
                    </circle>
                    ''')
                    
                    bullet_delay += 0.2  # Stagger bullet timing
        
        bullets_svg.append('</g>')
        return '\n'.join(bullets_svg)
    
    def _generate_explosion_effects(self, grid_x: int, grid_y: int,
                                  grid: List[List[Dict]], colors: Dict[str, str]) -> str:
        """Generate explosion effects when bullets hit cells."""
        explosions_svg = ['<g id="explosions">']
        
        bullet_delay = 0
        
        for week_idx, week in enumerate(grid):
            for day_idx, day in enumerate(week):
                if day.get('count', 0) > 0:
                    target_x = grid_x + week_idx * (self.cell_size + self.cell_gap) + self.cell_size // 2
                    target_y = grid_y + day_idx * (self.cell_size + self.cell_gap) + self.cell_size // 2
                    
                    # Calculate when bullet arrives
                    distance = math.sqrt((target_x - 50) ** 2 + (target_y - 100) ** 2)
                    arrival_time = bullet_delay + (distance / 100)
                    
                    explosions_svg.append(f'''
                    <g>
                        <circle cx="{target_x}" cy="{target_y}" r="0" 
                                fill="{colors['explosion']}" opacity="0" class="explosion">
                            <animate attributeName="r" 
                                values="0; 8; 0" 
                                dur="0.5s" 
                                begin="{arrival_time}s"/>
                            <animate attributeName="opacity" 
                                values="0; 1; 0" 
                                dur="0.5s" 
                                begin="{arrival_time}s"/>
                        </circle>
                        
                        <!-- Sparks -->
                        <g opacity="0">
                            <animate attributeName="opacity" values="0; 1; 0" dur="0.3s" begin="{arrival_time}s"/>
                            <line x1="{target_x}" y1="{target_y}" x2="{target_x - 5}" y2="{target_y - 5}" 
                                  stroke="{colors['explosion']}" stroke-width="1"/>
                            <line x1="{target_x}" y1="{target_y}" x2="{target_x + 5}" y2="{target_y - 5}" 
                                  stroke="{colors['explosion']}" stroke-width="1"/>
                            <line x1="{target_x}" y1="{target_y}" x2="{target_x - 5}" y2="{target_y + 5}" 
                                  stroke="{colors['explosion']}" stroke-width="1"/>
                            <line x1="{target_x}" y1="{target_y}" x2="{target_x + 5}" y2="{target_y + 5}" 
                                  stroke="{colors['explosion']}" stroke-width="1"/>
                        </g>
                    </g>
                    ''')
                    
                    bullet_delay += 0.2
        
        explosions_svg.append('</g>')
        return '\n'.join(explosions_svg)


def test_animation_generator():
    """Test function for the animation generator."""
    # Create mock contribution data
    mock_grid = []
    for week in range(10):
        week_data = []
        for day in range(7):
            week_data.append({
                'date': '2024-01-01',
                'count': week * day if (week + day) % 3 == 0 else 0,
                'level': min(4, week * day // 3) if (week + day) % 3 == 0 else 0
            })
        mock_grid.append(week_data)
    
    mock_metadata = {
        'username': 'testuser',
        'total_contributions': 42,
        'max_contributions': 15
    }
    
    generator = CanonAnimationGenerator()
    svg = generator.generate_animation(mock_grid, mock_metadata)
    
    print(f"Generated SVG with {len(svg)} characters")
    print("Animation features included: canon movement, bullets, explosions")
    
    return svg


if __name__ == "__main__":
    test_animation_generator()