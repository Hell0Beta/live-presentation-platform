# Live Presentation Platform

A real-time presentation broadcasting system for local area networks (LAN). Presenters can share PowerPoint presentations or screen content with multiple audience members simultaneously with zero external dependencies.

## Features

### For Presenters
- **Easy Authentication**: Name-based login with no passwords
- **Presentation Management**: Upload PowerPoint files (.ppt, .pptx)
- **Real-time Navigation**: Previous/Next controls for slide navigation
- **Screen Sharing**: Stream your screen directly to audience members
- **Session Management**: Auto-generated presentation codes, 8-hour expiration
- **Audience Monitoring**: See connected audience members in real-time

### For Audience Members
- **Simple Join**: Enter presentation code to view
- **Real-time Sync**: Automatic synchronization with presenter (2-second polling)
- **Passive Viewing**: Watch without navigation controls
- **Session Information**: See presenter name and current slide number

## Technology Stack

- **Framework**: Next.js 16+ (Full-stack)
- **UI**: React with Tailwind CSS and shadcn/ui
- **Storage**: JSON file-based database
- **Authentication**: Session-based (no passwords)
- **Deployment**: LAN-only (no external internet required)

## Getting Started

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd live-presentation-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the application**
   ```bash
   npm run build
   ```

4. **Start the server**
   ```bash
   npm start
   ```

The application will be available at `http://localhost:3000`

### For LAN Deployment

1. Find your server machine's IP address:
   - **Windows**: `ipconfig` (look for IPv4 Address)
   - **macOS/Linux**: `ifconfig` (look for inet address)

2. Share the server IP with audience members (e.g., `http://192.168.1.100:3000`)

3. All users access the same URL and select their role (Presenter or Audience)

## Usage

### As a Presenter

1. Visit the application URL and enter your name
2. Select "Presenter" role
3. You'll receive a 6-character presentation code
4. Share this code with audience members
5. Upload a PowerPoint presentation or click "Start Screen Share"
6. Use Previous/Next buttons to navigate slides
7. Monitor connected audience members in real-time

### As an Audience Member

1. Visit the application URL and enter your name
2. Select "Audience" role
3. Enter the presentation code provided by the presenter
4. Watch the presentation as it's navigated by the presenter
5. The view updates every 2 seconds automatically

## File Structure

```
├── app/
│   ├── api/                    # Backend API routes
│   │   ├── auth/              # Authentication endpoint
│   │   ├── presentation/      # Presentation management
│   │   │   ├── create/        # Create new session
│   │   │   ├── upload/        # Upload presentation file
│   │   │   ├── [code]/        # Presentation-specific endpoints
│   │   │   │   ├── join/      # Audience join endpoint
│   │   │   │   ├── current/   # Get current slide
│   │   │   │   └── navigate/  # Navigate slides
│   │   └── screenshare/       # Screen sharing endpoints
│   ├── presenter/             # Presenter dashboard page
│   ├── audience/              # Audience viewer page
│   ├── login/                 # Login page
│   └── layout.tsx             # Root layout
├── components/
│   ├── LoginForm.tsx          # Login component
│   ├── PresenterDashboard.tsx # Presenter UI
│   ├── AudienceViewer.tsx     # Audience viewer
│   ├── ScreenShareControl.tsx # Screen sharing control
│   └── ui/                    # shadcn/ui components
├── lib/
│   ├── types.ts               # TypeScript interfaces
│   ├── dataStore.ts           # JSON file operations
│   ├── codeGenerator.ts       # Presentation code generation
│   └── screenCapture.ts       # Screen capture utilities
├── data/
│   ├── presentations.json     # Presentations database
│   └── uploads/               # Uploaded presentations
└── public/                    # Static files
```

## Configuration

### Environment Variables (Optional)

Create a `.env.local` file for custom settings:

```env
# Maximum file upload size (bytes, default 50MB)
UPLOAD_MAX_SIZE=52428800

# Presentation session expiry (hours, default 8)
SESSION_EXPIRY_HOURS=8

# Maximum audience per presentation (default 50)
MAX_AUDIENCE_PER_SESSION=50

# Polling interval for audience (milliseconds, default 2000)
POLL_INTERVAL_MS=2000
```

## API Reference

### Authentication
- `POST /api/auth` - Create user session
  - Body: `{ name: string, role: 'presenter' | 'audience' }`
  - Returns: `{ sessionId, userName, role }`

### Presentation Management
- `POST /api/presentation/create` - Create new presentation
- `POST /api/presentation/upload` - Upload presentation file
- `POST /api/presentation/[code]/join` - Join as audience
- `GET /api/presentation/[code]/current` - Get current slide
- `POST /api/presentation/[code]/navigate` - Navigate slides

### Screen Sharing
- `POST /api/screenshare/start` - Start screen sharing mode

## System Requirements

### Server
- Node.js 18.x or higher
- 2GB RAM minimum
- 2GB free disk space
- LAN connectivity

### Client
- Modern browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- 1024x768 minimum resolution
- LAN connectivity to server
- WebRTC support for screen sharing

## Performance

- **Slide Navigation**: < 500ms
- **Audience Sync**: 2-second polling interval
- **Concurrent Users**: Supports 50+ audience members per presentation
- **Concurrent Sessions**: 10+ simultaneous presentations
- **Max Presentation Size**: Up to 200 slides

## Security

- No external network access required
- Session-based authentication (no password storage)
- Automatic session expiration (8 hours default)
- File upload validation
- LAN-only deployment

## Troubleshooting

### Slides Not Syncing
- Check network connectivity between presenter and audience
- Verify polling interval setting (default 2 seconds)
- Try refreshing the browser

### Upload Fails
- Verify file is .ppt or .pptx format
- Check file size is under 50MB
- Ensure sufficient disk space

### Code Not Working
- Confirm presentation hasn't expired (8 hours)
- Verify correct code was entered
- Check if presentation is still active

### Screen Share Not Working
- Verify browser supports WebRTC
- Grant screen capture permission in browser
- Try using HTTPS in production environments

## Development

### Running in Development Mode

```bash
npm run dev
```

Visit `http://localhost:3000` in your browser.

### Building for Production

```bash
npm run build
npm start
```

## Future Enhancements

- WebSocket real-time sync (replacing polling)
- Presentation recording
- Audience Q&A/chat
- Drawing annotation tools
- PDF presentation support
- Mobile-optimized interface
- Presenter notes
- Slide thumbnails
- Dark mode theme

## License

This project is provided as-is for educational and organizational use.

## Support

For issues or questions:
1. Check the Troubleshooting section above
2. Review browser console for error messages
3. Verify all system requirements are met
4. Check that LAN connectivity is working properly

## Architecture Notes

### Data Storage
- Presentations are stored in `data/presentations.json`
- Uploaded files are stored in `data/uploads/[code]/`
- Slide images are extracted to `data/uploads/[code]/slides/`

### Real-time Synchronization
- Audience members poll the `/api/presentation/[code]/current` endpoint every 2 seconds
- Server maintains single source of truth in `presentations.json`
- Atomic file writes prevent data corruption

### Session Management
- Presentation codes are 6-character alphanumeric (avoiding ambiguous letters)
- Sessions expire after 8 hours by default
- Expired sessions are automatically cleaned up

---

**Version**: 1.0  
**Last Updated**: February 15, 2026
