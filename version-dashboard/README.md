# Version Dashboard

A beautiful React-based dashboard for managing version loading through SignalR communication.

## Features

- 🎨 **Modern UI Design**: Beautiful gradient backgrounds and smooth animations
- 📡 **SignalR Integration**: Real-time communication with your backend
- 🔄 **Connection Status**: Visual indicator showing connection state
- 📱 **Responsive Design**: Works perfectly on desktop and mobile devices
- ⚡ **Loading States**: Visual feedback during message sending

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or pnpm

### Installation

1. Install dependencies:
```bash
npm install
# or
pnpm install
```

2. Start the development server:
```bash
npm run dev
# or
pnpm dev
```

3. Open your browser and navigate to `http://localhost:5173`

## Usage

The dashboard provides two main buttons:

- **Cargar V1**: Sends "v1" message to SignalR
- **Cargar V2**: Sends "v2" message to SignalR

### SignalR Configuration

The dashboard is configured to connect to a SignalR hub at:
```
http://localhost:5018/hub
```

Make sure your SignalR backend is running on this endpoint and implements:
- `SendMessage` method to receive version messages
- `ReceiveMessage` event to send responses back to the client

### Features

- **Connection Status**: Shows real-time connection status with visual indicators
- **Message History**: Displays the last sent message
- **Loading States**: Buttons show loading spinners during message transmission
- **Error Handling**: Graceful handling of connection errors
- **Auto-reconnect**: Automatically reconnects if connection is lost

## Development

### Project Structure

```
src/
├── App.tsx          # Main dashboard component
├── App.css          # Dashboard styles
├── index.css        # Global styles
└── main.tsx         # Application entry point
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Technologies Used

- **React 19** - UI framework
- **TypeScript** - Type safety
- **SignalR** - Real-time communication
- **Vite** - Build tool and dev server
- **CSS3** - Modern styling with gradients and animations

## Customization

You can easily customize the dashboard by:

1. **Changing SignalR URL**: Update the URL in `App.tsx`
2. **Modifying Colors**: Update CSS variables in `App.css`
3. **Adding More Versions**: Extend the button array in the component
4. **Custom Messages**: Modify the message format in `sendVersionMessage`

## License

This project is open source and available under the MIT License.
