"""
Test script to verify the GitHub Contribution Canon functionality.
"""
import sys
import os

# Add src directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from github_fetcher import GitHubContributionFetcher
from animation_generator import CanonAnimationGenerator


def test_github_fetcher():
    """Test GitHub contribution fetcher."""
    print("Testing GitHub Contribution Fetcher...")
    
    try:
        fetcher = GitHubContributionFetcher()
        
        # Test with a well-known user (octocat)
        print("Fetching data for 'octocat'...")
        data = fetcher.fetch_contributions('octocat')
        
        print(f"✅ Successfully fetched {len(data['contributions'])} contribution days")
        print(f"   Total contributions: {data['total_contributions']}")
        print(f"   Max daily: {data['max_contributions']}")
        print(f"   Username: {data['username']}")
        
        # Test grid organization
        grid, metadata = fetcher.get_contribution_grid('octocat')
        print(f"✅ Grid organized into {len(grid)} weeks")
        print(f"   Metadata: {metadata}")
        
        return True, grid, metadata
        
    except Exception as e:
        print(f"❌ GitHub fetcher test failed: {e}")
        return False, None, None


def test_animation_generator(grid, metadata):
    """Test SVG animation generator."""
    print("\nTesting Animation Generator...")
    
    try:
        generator = CanonAnimationGenerator()
        
        # Test different themes and styles
        themes_to_test = ['light', 'dark', 'neon', 'retro']
        canons_to_test = ['classic', 'tank', 'spaceship']
        
        for theme in themes_to_test[:2]:  # Test first 2 themes to save time
            for canon in canons_to_test[:2]:  # Test first 2 canons
                svg = generator.generate_animation(
                    grid, metadata, theme=theme, canon_style=canon, speed='fast'
                )
                
                # Basic validation
                assert '<svg' in svg, f"SVG tag missing in {theme}/{canon}"
                assert '</svg>' in svg, f"SVG closing tag missing in {theme}/{canon}"
                assert f'animateTransform' in svg, f"Animation missing in {theme}/{canon}"
                
                print(f"✅ Generated {theme}/{canon} animation ({len(svg)} chars)")
        
        # Save a sample animation for manual inspection
        sample_svg = generator.generate_animation(grid, metadata, theme='dark', canon_style='tank')
        
        # Write sample to file
        sample_path = os.path.join(os.path.dirname(__file__), 'sample_animation.svg')
        with open(sample_path, 'w', encoding='utf-8') as f:
            f.write(sample_svg)
        
        print(f"✅ Sample animation saved to: {sample_path}")
        return True
        
    except Exception as e:
        print(f"❌ Animation generator test failed: {e}")
        return False


def test_integration():
    """Test the complete integration."""
    print("\n" + "="*50)
    print("Running GitHub Contribution Canon Tests")
    print("="*50)
    
    # Test GitHub fetcher
    fetcher_success, grid, metadata = test_github_fetcher()
    
    if not fetcher_success:
        print("\n❌ Tests failed at GitHub fetcher stage")
        return False
    
    # Test animation generator
    generator_success = test_animation_generator(grid, metadata)
    
    if not generator_success:
        print("\n❌ Tests failed at animation generator stage")
        return False
    
    print("\n" + "="*50)
    print("🎉 All tests passed successfully!")
    print("="*50)
    print("\nYour GitHub Contribution Canon is ready!")
    print("Start the server with: python app.py")
    print("Then visit: http://localhost:5000")
    
    return True


if __name__ == "__main__":
    test_integration()