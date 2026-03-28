# PR: Portfolio Charts & Proactive Notifications

## Overview
Implements actionable portfolio visualization and AI-driven proactive nudging to keep users on track with their savings goals.

## Issues Addressed

### 1. Dynamic Portfolio Charts
- **Chart Component**: Custom SVG pie/donut chart with zero external dependencies
- **Data Binding**: Allocations dynamically bind to OpenClaw agent strategy output
- **Interactive**: Hover tooltips show asset name and percentage
- **Legend**: Color-coded legend matches Vanilla CSS theme (Purple/Cyan/Amber)
- **Live Updates**: Chart automatically rerenders when strategy changes

**Files**:
- `frontend/src/app/PortfolioChart.tsx` - SVG chart component
- `frontend/src/utils/chartUtils.ts` - Pie slice calculations & path generation
- `frontend/src/utils/allocationParser.ts` - Extracts allocations from agent messages
- `frontend/src/app/globals.css` - Chart styling

### 2. Proactive Notification Triggers
- **Backend Detection**: Monitors goals; triggers when "Falling Behind" detected
- **AI-Powered Messages**: Claude generates contextual, empathetic proactive nudges
- **Real-Time Push**: WebSocket broadcasts suggestions to active frontend sessions
- **Concrete Suggestions**: Proposes exact contribution increases (e.g., "$50 increase")
- **Resilient**: Auto-reconnect, graceful error handling, monitoring only when active

**Files**:
- `agent/notification-service.ts` - Goal monitoring & message generation
- `agent/websocket-server.ts` - Real-time client management
- `agent/agent-service.ts` - Claude API integration
- `agent/notification-monitor.ts` - Service runner
- `frontend/src/hooks/useNotifications.ts` - WebSocket connection hook
- `frontend/src/utils/suggestionHandler.ts` - Suggestion parsing utilities
- `frontend/src/app/page.tsx` - Notification integration
- `.env.example` - Configuration template

## Acceptance Criteria ✅

- [x] Allocation chart replaces static UI bars; updates dynamically
- [x] Chart renders cleanly without bundle bloat
- [x] Legend clearly corresponds to chart colors
- [x] Backend initiates contact without user prompt when "Falling Behind"
- [x] Frontend displays incoming agent messages dynamically
- [x] OpenClaw's suggested rebalancing matches internal calculations

## Testing

Run integration test:
```bash
cd agent
npm run test
```

Or test notifications specifically:
```bash
npm run notifications
```

## Environment Setup

Copy `.env.example` to `.env` and set:
- `ANTHROPIC_API_KEY` - Claude API key for message generation
- `NOTIFICATION_PORT` - WebSocket server port (default: 3001)
- `NEXT_PUBLIC_WS_URL` - Frontend WebSocket URL (default: ws://localhost:3001)

## Notes

- Charts use pure SVG (no Recharts, Plotly, etc.) → minimal bundle size
- Notification monitoring runs every 5 minutes only while clients connected
- WebSocket includes exponential backoff reconnection
- Proactive messages display with "Proactive Nudge" badge for clarity
