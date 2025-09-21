# Contributing to GitHub Contribution Canon

Thank you for your interest in contributing! This document provides guidelines and information for contributors.

## 🚀 Getting Started

1. Fork the repository
2. Create a new branch for your feature: `git checkout -b feature/amazing-feature`
3. Set up your development environment (see README.md)
4. Make your changes
5. Test your changes: `python test_functionality.py`
6. Commit your changes: `git commit -m 'Add amazing feature'`
7. Push to your branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

## 📋 Development Guidelines

### Code Style
- Follow PEP 8 Python style guidelines
- Use type hints where appropriate
- Add docstrings to all functions and classes
- Keep functions focused and single-purpose

### Testing
- Add tests for new features
- Ensure all existing tests pass
- Test both success and error cases
- Include integration tests for API endpoints

### Documentation
- Update README.md for user-facing changes
- Add inline comments for complex logic
- Update API documentation for endpoint changes

## 🎯 Feature Ideas

### Animation Enhancements
- New canon styles (laser cannon, medieval trebuchet, etc.)
- Additional themes (cyberpunk, minimalist, etc.)
- Sound effects toggle
- Custom explosion effects

### API Improvements
- GraphQL endpoint
- Webhook support for automatic updates
- Custom color palettes
- Animation duration controls

### Performance & Infrastructure
- Redis caching
- CDN integration
- Rate limiting improvements
- Health monitoring

### User Experience
- Animation preview with live updates
- Embed code generator
- Social media sharing
- Mobile-responsive design

## 🐛 Bug Reports

When reporting bugs, please include:
- GitHub username that causes the issue
- Browser and operating system
- Expected vs actual behavior
- Console errors (if any)
- Steps to reproduce

## 💡 Feature Requests

For feature requests, please:
- Check if a similar request already exists
- Explain the use case and benefits
- Provide mockups or examples if possible
- Consider implementation complexity

## 🔧 Technical Architecture

### Core Components
- `github_fetcher.py`: GitHub API integration
- `animation_generator.py`: SVG animation creation
- `app.py`: Flask web service
- `templates/`: HTML templates

### Data Flow
1. User requests animation for username
2. Fetch contribution data from GitHub API
3. Generate animated SVG with canon shooting at squares
4. Cache and serve the animation
5. Display in web interface or README

### Adding New Themes
1. Add theme colors to `_get_theme_colors()` in `animation_generator.py`
2. Update theme selector in templates
3. Add theme to documentation

### Adding New Canon Styles
1. Create new generator method (e.g., `_generate_robot_canon()`)
2. Add to style selection in `_generate_canon_animation()`
3. Update documentation and examples

## 📝 Commit Message Convention

Use clear, descriptive commit messages:
- `feat: add spaceship canon style`
- `fix: resolve animation timing issues`
- `docs: update API documentation`
- `test: add integration tests`
- `refactor: optimize SVG generation`

## 🎉 Recognition

Contributors will be:
- Listed in the README.md contributors section
- Mentioned in release notes for significant contributions
- Invited to help maintain the project (for regular contributors)

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🤝 Code of Conduct

Please be respectful and inclusive. We welcome contributions from developers of all backgrounds and skill levels.

---

Need help? Open an issue or start a discussion. We're here to help! 🚀