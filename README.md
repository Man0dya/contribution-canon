# 🎯 Contribution Canon

Transform your GitHub contribution graph into an epic cannon animation! Watch as cannons blast through your commits in spectacular fashion.

![Contribution Canon Demo](./public/demo.gif)

## ✨ Features

- 🎯 **Precision Targeting** - Cannons accurately target each contribution
- ⚡ **Smooth Animations** - Optimized SVG animations for all devices
- 🎨 **Multiple Themes** - Choose from various color schemes
- 📐 **Custom Sizes** - Small, medium, or large animations
- 🚀 **Easy Integration** - One-click copy for README files
- 📱 **Responsive Design** - Beautiful UI that works everywhere
- 🔄 **Auto-Loop** - Continuous animation cycles
- ⚙️ **Customizable Speed** - Adjust animation timing

## 🚀 Quick Start

1. Visit [Contribution Canon](https://yourusername.github.io/contribution-canon)
2. Enter your GitHub username
3. Customize your cannon theme and settings
4. Copy the generated markdown code
5. Paste into your README.md file
6. Watch your contributions get blasted! 💥

## 🎨 Themes Available

- **Default** - Classic blue cannon with orange explosions
- **Dark Mode** - Purple cannon with golden blasts
- **Neon** - Vibrant cyan and magenta cyberpunk style
- **Retro** - Warm yellows and oranges for vintage vibes

## 🛠️ For Developers

### Local Development

```bash
# Clone the repository
git clone https://github.com/yourusername/contribution-canon.git
cd contribution-canon

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production

```bash
# Build the project
npm run build

# Deploy to GitHub Pages
npm run deploy
```

### Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Deployment**: GitHub Pages

### Project Structure

```
src/
├── components/
│   ├── Hero.jsx              # Landing page hero section
│   ├── UsernameForm.jsx      # GitHub username input form
│   ├── CannonAnimation.jsx   # Main animation component
│   ├── CodeGenerator.jsx     # SVG and markdown generator
│   └── Footer.jsx            # Footer with links
├── utils/
│   └── github.js             # GitHub API utilities
├── App.jsx                   # Main application component
├── main.jsx                  # React entry point
└── index.css                 # Global styles and Tailwind
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file for custom configuration:

```env
VITE_GITHUB_TOKEN=your_github_token  # Optional: for higher API limits
VITE_BASE_URL=your_custom_domain     # Optional: for custom deployment
```

### Customization

You can modify themes, add new animation patterns, or customize the cannon design by editing:

- `src/components/CannonAnimation.jsx` - Animation logic
- `src/components/CodeGenerator.jsx` - Theme definitions
- `src/index.css` - Global styles and animations

## 📊 API Reference

### GitHub Data Fetching

The app uses GitHub's public contribution data. For higher rate limits, you can optionally provide a GitHub token.

### SVG Generation

Generated SVGs are self-contained with embedded CSS animations and can be used in:

- GitHub README files
- Documentation sites
- Personal websites
- Social media profiles

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Ideas for Contributions

- New cannon themes and animations
- Different projectile types (rockets, lasers, etc.)
- Sound effects (optional toggle)
- More GitHub integrations (stars, commits, etc.)
- Performance optimizations
- Accessibility improvements

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by the original [GitHub Snake](https://github.com/Platane/snk) animation
- GitHub for providing the contribution graph data
- The amazing React and Vite communities
- All the developers who make open source possible

## 🐛 Bug Reports & Feature Requests

Found a bug or have an idea for a new feature? Please [open an issue](https://github.com/yourusername/contribution-canon/issues) with:

- Clear description of the issue/feature
- Steps to reproduce (for bugs)
- Expected vs actual behavior
- Screenshots if applicable

## ⭐ Show Your Support

If you found this project helpful, please consider:

- ⭐ Starring this repository
- 🔄 Sharing it with other developers
- 🐛 Reporting bugs or suggesting improvements
- ☕ [Buying me a coffee](https://buymeacoffee.com/yourusername)

---

**Made with ❤️ for the developer community**

Transform your GitHub profile with an epic contribution cannon today! 🎯💥