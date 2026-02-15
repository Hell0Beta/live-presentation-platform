# Quick Start Guide

## 60-Second Setup

### 1. Start the Server

```bash
npm install
npm run build
npm start
```

The application will be ready at `http://localhost:3000`

### 2. Find Your IP Address

Open a terminal on the server machine and run:

**Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" (something like `192.168.1.100`)

**macOS/Linux:**
```bash
ifconfig
```
Look for "inet" address (something like `192.168.1.100`)

### 3. Share the URL

Give audience members this URL:
```
http://[YOUR_IP]:3000
```

Example: `http://192.168.1.100:3000`

---

## Using the Platform

### Presenter Flow

1. Open `http://localhost:3000`
2. Enter your name
3. Select **Presenter**
4. You'll see a 6-character code (e.g., `ABC123`)
5. Share this code with audience members
6. Upload a PowerPoint file or click "Start Screen Share"
7. Use **Previous/Next** to navigate slides

### Audience Flow

1. Open the shared URL on your device
2. Enter your name
3. Select **Audience**
4. Enter the presentation code from the presenter
5. Watch the presentation update automatically

---

## Testing Locally

To test both roles on the same machine:

1. **Terminal 1**: Start the server
   ```bash
   npm start
   ```

2. **Browser 1**: Open `http://localhost:3000` as **Presenter**
   - Enter name and select Presenter
   - Note the code displayed

3. **Browser 2**: Open `http://localhost:3000` as **Audience**
   - Enter name and select Audience
   - Enter the code from Browser 1

4. In Browser 1 (Presenter), upload a file or test navigation
5. In Browser 2 (Audience), watch the changes sync automatically

---

## Troubleshooting

### "Cannot connect to server"
- Ensure the server is running (`npm start`)
- Check the IP address is correct
- Both devices must be on the same network

### "File upload fails"
- Use .ppt or .pptx files only
- Maximum 50MB
- Check disk space available

### "Slides not updating"
- Check network connection between devices
- Wait 2 seconds for sync
- Try refreshing the browser

### "Code doesn't work"
- Verify code is typed correctly (case-insensitive)
- Check presentation hasn't expired (8 hours)
- Ensure presenter hasn't ended the session

---

## File Upload Note

When you upload a PowerPoint file:
- Files are processed and stored on the server
- Slides are converted to images for viewing
- Current implementation shows a placeholder slide

For production use with actual PowerPoint rendering, integrate a library like:
- `pptxgenjs` - for PowerPoint generation
- `libreoffice` - for server-side conversion
- `puppeteer` - for server-side rendering

---

## Production Deployment

### On a LAN Server

1. Install Node.js 18+ on the server machine
2. Copy project files to server
3. Run `npm install && npm run build && npm start`
4. Server will run on port 3000
5. Access from any device on the network using server's IP

### Ports & Firewall

- Application runs on **port 3000**
- Ensure port 3000 is not blocked by firewall
- Configure firewall to allow TCP traffic on port 3000

### Performance Tips

- For 50+ audience members, consider:
  - Running on a machine with 4GB+ RAM
  - Connecting via gigabit ethernet
  - Using a dedicated server machine

---

## Features Overview

### Presenter Dashboard
- **Presentation Code**: 6-character code to share with audience
- **Upload Interface**: Drag-and-drop PowerPoint files
- **Navigation**: Previous/Next buttons for slides
- **Audience Monitor**: See connected viewers in real-time
- **Screen Share**: Stream entire screen to audience
- **Live Preview**: See current slide (placeholder in preview)

### Audience Viewer
- **Auto-sync**: Updates every 2 seconds
- **Full Screen**: Optimized for presentations
- **Presenter Info**: See presenter name and current slide
- **Code Display**: Reference the presentation code

---

## Limitations & Notes

1. **Local Network Only**: Designed for LAN use, not internet
2. **No Recording**: Presentations are not recorded
3. **No Chat**: No built-in audience interaction
4. **Simple Sync**: 2-second polling (not real-time WebSocket)
5. **File Conversion**: Basic slide counting, not full parsing

---

## Next Steps

1. Test with sample PowerPoint files
2. Monitor connected audience members
3. Check the full README for advanced configuration
4. Review API documentation for custom integrations

---

For detailed information, see [README.md](./README.md)
