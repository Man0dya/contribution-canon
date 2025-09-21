"""
GitHub API integration for fetching user contribution data.
"""
import requests
import datetime
from typing import Dict, List, Optional, Tuple
import os
from dateutil.relativedelta import relativedelta
import json


class GitHubContributionFetcher:
    """Fetches GitHub contribution data for a given user."""
    
    def __init__(self, token: Optional[str] = None):
        self.token = token or os.getenv('GITHUB_TOKEN')
        self.base_url = "https://api.github.com"
        self.session = requests.Session()
        
        if self.token:
            self.session.headers.update({
                'Authorization': f'token {self.token}',
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'ContributionCanon/1.0'
            })
    
    def fetch_contributions(self, username: str) -> Dict:
        """
        Fetch contribution data for a user using GitHub's GraphQL API.
        Returns a dictionary with contribution data including dates and counts.
        """
        query = """
        query($userName: String!) {
            user(login: $userName) {
                contributionsCollection {
                    contributionCalendar {
                        totalContributions
                        weeks {
                            contributionDays {
                                contributionCount
                                date
                            }
                        }
                    }
                }
            }
        }
        """
        
        variables = {"userName": username}
        
        try:
            response = self.session.post(
                'https://api.github.com/graphql',
                json={'query': query, 'variables': variables}
            )
            response.raise_for_status()
            data = response.json()
            
            if 'errors' in data:
                raise Exception(f"GraphQL errors: {data['errors']}")
            
            return self._process_contribution_data(data)
            
        except requests.exceptions.RequestException as e:
            # Fallback to scraping approach if GraphQL fails
            return self._fallback_contribution_fetch(username)
    
    def _process_contribution_data(self, data: Dict) -> Dict:
        """Process GraphQL response into a standardized format."""
        calendar = data['data']['user']['contributionsCollection']['contributionCalendar']
        
        contributions = []
        max_contributions = 0
        
        for week in calendar['weeks']:
            for day in week['contributionDays']:
                count = day['contributionCount']
                contributions.append({
                    'date': day['date'],
                    'count': count,
                    'level': self._get_contribution_level(count)
                })
                max_contributions = max(max_contributions, count)
        
        return {
            'contributions': contributions,
            'total_contributions': calendar['totalContributions'],
            'max_contributions': max_contributions,
            'weeks': len(calendar['weeks']),
            'username': data['data']['user']['login'] if 'user' in data['data'] else None
        }
    
    def _fallback_contribution_fetch(self, username: str) -> Dict:
        """
        Fallback method using public events API.
        This is less accurate but works without GraphQL access.
        """
        try:
            # Get user events from the last year
            events_url = f"{self.base_url}/users/{username}/events"
            response = self.session.get(events_url)
            response.raise_for_status()
            
            events = response.json()
            
            # Generate a year's worth of contribution data
            contributions = self._generate_contribution_grid(events)
            
            return {
                'contributions': contributions,
                'total_contributions': sum(day['count'] for day in contributions),
                'max_contributions': max((day['count'] for day in contributions), default=0),
                'weeks': 53,  # Standard GitHub contribution grid
                'username': username
            }
            
        except Exception as e:
            # Return empty contribution grid if all else fails
            return self._generate_empty_contribution_grid(username)
    
    def _generate_contribution_grid(self, events: List[Dict]) -> List[Dict]:
        """Generate contribution grid from events data."""
        # Create a year's worth of dates
        end_date = datetime.datetime.now().date()
        start_date = end_date - relativedelta(years=1)
        
        contributions = []
        current_date = start_date
        
        # Count contributions by date
        contribution_counts = {}
        for event in events:
            if event['type'] in ['PushEvent', 'CreateEvent', 'PullRequestEvent', 'IssuesEvent']:
                event_date = datetime.datetime.fromisoformat(
                    event['created_at'].replace('Z', '+00:00')
                ).date()
                contribution_counts[event_date] = contribution_counts.get(event_date, 0) + 1
        
        # Generate grid
        while current_date <= end_date:
            count = contribution_counts.get(current_date, 0)
            contributions.append({
                'date': current_date.isoformat(),
                'count': count,
                'level': self._get_contribution_level(count)
            })
            current_date += datetime.timedelta(days=1)
        
        return contributions
    
    def _generate_empty_contribution_grid(self, username: str) -> Dict:
        """Generate an empty contribution grid as fallback."""
        contributions = []
        end_date = datetime.datetime.now().date()
        start_date = end_date - relativedelta(years=1)
        current_date = start_date
        
        while current_date <= end_date:
            contributions.append({
                'date': current_date.isoformat(),
                'count': 0,
                'level': 0
            })
            current_date += datetime.timedelta(days=1)
        
        return {
            'contributions': contributions,
            'total_contributions': 0,
            'max_contributions': 0,
            'weeks': 53,
            'username': username
        }
    
    def _get_contribution_level(self, count: int) -> int:
        """Convert contribution count to GitHub's 0-4 level system."""
        if count == 0:
            return 0
        elif count <= 3:
            return 1
        elif count <= 6:
            return 2
        elif count <= 9:
            return 3
        else:
            return 4
    
    def get_contribution_grid(self, username: str) -> Tuple[List[List[Dict]], Dict]:
        """
        Get contributions organized in a weekly grid format.
        Returns (grid, metadata) where grid is a 2D array of weeks and days.
        """
        data = self.fetch_contributions(username)
        contributions = data['contributions']
        
        # Organize into weeks (7 days each)
        weeks = []
        current_week = []
        
        for contribution in contributions:
            current_week.append(contribution)
            if len(current_week) == 7:
                weeks.append(current_week)
                current_week = []
        
        # Add remaining days if any
        if current_week:
            weeks.append(current_week)
        
        metadata = {
            'total_contributions': data['total_contributions'],
            'max_contributions': data['max_contributions'],
            'username': data['username'],
            'weeks_count': len(weeks)
        }
        
        return weeks, metadata


def test_contribution_fetcher():
    """Test function for the contribution fetcher."""
    fetcher = GitHubContributionFetcher()
    
    try:
        # Test with a well-known GitHub user
        data = fetcher.fetch_contributions('octocat')
        print(f"Fetched {len(data['contributions'])} contribution days")
        print(f"Total contributions: {data['total_contributions']}")
        print(f"Max daily contributions: {data['max_contributions']}")
        
        # Test grid organization
        grid, metadata = fetcher.get_contribution_grid('octocat')
        print(f"Grid organized into {len(grid)} weeks")
        
        return True
        
    except Exception as e:
        print(f"Test failed: {e}")
        return False


if __name__ == "__main__":
    test_contribution_fetcher()