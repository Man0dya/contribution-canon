# GitHub Contribution Canon Animation

A fun web service that generates animated SVGs of a canon shooting at your GitHub contribution graph. Perfect for spicing up your GitHub README!

## 🎯 Features

- **Animated Canon**: Watch a canon drive and shoot at your contribution squares
- **Customizable**: Different themes, colors, and animation speeds
- **Easy Embedding**: Simple URL format for GitHub READMEs
- **Fast & Reliable**: Cached animations for optimal performance

## 🚀 Quick Start

### Embed in your README:

```markdown
![GitHub Contribution Canon](https://your-domain.com/USERNAME)
```

### With customization:

```markdown
![GitHub Contribution Canon](https://your-domain.com/USERNAME?theme=dark&speed=fast&canon=tank)
```

> **Note:** Replace `your-domain.com` with your deployed app URL. For local testing, use `http://localhost:5001`

## 📖 API Documentation

### Basic Usage
```
GET /{username}
```

### Parameters
- `theme`: `light` (default), `dark`, `neon`, `retro`
- `speed`: `slow`, `normal` (default), `fast`
- `canon`: `classic` (default), `tank`, `spaceship`
- `color`: Custom hex color (e.g., `ff6b35`)

### Examples
```
/octocat
/octocat?theme=dark
/octocat?theme=neon&speed=fast
/octocat?canon=tank&color=ff6b35
```

## � Deployment

### Heroku Deployment
1. Create a new Heroku app
2. Set environment variables:
   ```bash
   heroku config:set GITHUB_TOKEN=your_token_here
   heroku config:set SECRET_KEY=your_secret_key
   ```
3. Deploy:
   ```bash
   git push heroku main
   ```

### Railway/Render Deployment
1. Connect your GitHub repository
2. Set environment variables in the dashboard
3. Deploy automatically on push

### Docker Deployment
```bash
docker build -t contribution-canon .
docker run -p 5000:5000 -e GITHUB_TOKEN=your_token contribution-canon
```

## �🛠️ Development

### Local Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/Man0dya/contribution-canon.git
   cd contribution-canon
   ```

2. Create virtual environment:
   ```bash
   python -m venv .venv
   .venv\Scripts\activate  # Windows
   # or
   source .venv/bin/activate  # macOS/Linux
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your GitHub token
   ```

5. Run the application:
   ```bash
   python app.py
   ```

6. Visit `http://localhost:5001` 

   > **Note**: If port 5000 is busy, the app runs on 5001. You can set a custom port with `export PORT=8080` (macOS/Linux) or `$env:PORT=8080` (Windows PowerShell).

### Testing
Run the test suite to verify functionality:
```bash
python test_functionality.py
```

## 📝 License

MIT License - Feel free to use and modify!

## 🤝 Contributing

Pull requests welcome! Please see CONTRIBUTING.md for guidelines.

---

Made with ❤️ for the GitHub community