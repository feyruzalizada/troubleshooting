# Enterprise Reliability Platform

A production-grade React 18 application demonstrating enterprise-level debugging tools, reliability monitoring, error boundaries, and observability dashboards.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI Framework | React 18 |
| Charts | Recharts 2 |
| Web Vitals | web-vitals 3 |
| Build Tool | Create React App 5 |
| Unique IDs | uuid 9 |
| Date Utilities | date-fns 3 |
| Debugging | Chrome DevTools + VSCode Launch Configs |

---

## Platform Reliability Requirements

### SLO Definitions

| SLO | Target | Alert Severity |
|-----|--------|---------------|
| Availability | ≥ 99.5% | CRITICAL |
| Error Rate | < 1.0% | HIGH |
| Response Latency P99 | < 250ms | MEDIUM |
| CPU Saturation | < 70% | MEDIUM |
| LCP (Core Web Vital) | ≤ 2,500ms | HIGH |
| FCP (Core Web Vital) | ≤ 1,800ms | HIGH |

### Error Budget Policy

The platform enforces a 0.5% error budget per rolling hour. When 5 or more errors are recorded within a 60-second window, the error tracking service automatically escalates to a CRITICAL alert and logs the spike event.

---

## Architecture

```
src/
├── index.js                          Entry point
├── App.js                            Root component, monitoring bootstrap
│
├── utils/
│   ├── logger.js                     Structured logger (5 levels, event bus)
│   └── metrics.js                    Metrics store, error/alert recording
│
├── services/
│   ├── monitoring.js                 Web Vitals, global error capture, PerformanceObserver
│   ├── errorTracking.js              Error recording, stats computation, rate detection
│   └── analytics.js                  Business metric simulation, SLO evaluation
│
├── hooks/
│   ├── useMonitoring.js              Raw metrics store subscriber
│   ├── useErrorTracking.js           Error stats + recent errors subscriber
│   └── usePerformance.js             Business metric latest + history subscriber
│
└── components/
    ├── ErrorBoundary/
    │   ├── GlobalErrorBoundary.js    App-level error boundary (CRITICAL)
    │   ├── PlatformErrorBoundary.js  Module-level boundary with retry limit
    │   └── ErrorFallback.js          Recovery UI component
    │
    ├── Dashboard/
    │   ├── ReliabilityDashboard.js   Main navigation shell + tabbed layout
    │   ├── PerformanceMetrics.js     KPI cards + trend charts
    │   ├── BusinessMetrics.js        SLO gauges + Four Golden Signals
    │   └── AlertPanel.js             Real-time alert list with ACK/Resolve
    │
    └── Debug/
        ├── DebugPanel.js             Fixed-position log console (Ctrl+Shift+D)
        └── SystemStatus.js           Status bar with live vitals + session info
```

---

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm 9 or higher

### Installation

```bash
cd enterprise-reliability-platform
npm install
```

### Running the Application

```bash
npm start
```

Opens at `http://localhost:3000`

### Building for Production

```bash
npm run build
```

---

## Feature Guide

### Dashboard Tabs

| Tab | Contents |
|-----|----------|
| **Performance** | 8 KPI metric cards + 4 live trend charts (response time, error rate, users, CPU/memory) |
| **Business Metrics** | 3 SLO radial gauges + revenue/throughput bar charts + Four Golden Signals panel |
| **Alerts** | Real-time alert list with severity filtering, ACK and RESOLVE actions |
| **Error Tracking** | Error stats, error log table, test error triggers |
| **Monitoring** | Service registry with pause/resume, Core Web Vitals panel, aggregated error tracker |
| **Debugging** | Event Timeline, Network Monitor, Memory Profiler, State Inspector |

### Debugging Tab

The **Debugging** tab provides four enterprise-grade debugging tools:

#### Event Timeline
- Real-time feed of all `enterprise:*` internal events
- Filterable by type: LOG, ERR, PERF, BIZ, ALERT, NET, ACK, RESOLVE
- Auto-scroll toggle, buffer cap at 500 events, CLEAR button
- Shows event type, timestamp, and structured payload summary

#### Network Monitor
- Intercepts all `fetch()` and `XMLHttpRequest` calls via runtime patching
- Displays method badge (GET/POST/PUT/DELETE), status code (color-coded), URL, duration, size, type
- Filters: ALL / GET / POST / PUT / DELETE / ERRORS
- Slow requests (>2s) auto-create a platform alert
- CLEAR button to reset capture history

#### Memory Profiler
- Samples `performance.memory` every 2 seconds (Chrome/Chromium only)
- Tracks `usedJSHeapSize`, `totalJSHeapSize`, `jsHeapSizeLimit`
- Live area chart with 60-sample rolling history
- Utilization progress bar (green → yellow → red)
- Auto-creates a `HIGH` alert when heap exceeds 80% of limit
- PAUSE / RESUME recording

#### State Inspector
- Live view of `window.__METRICS_STORE__` — the raw platform state
- Four collapsible sections: Errors, Performance, Business Metrics, Alerts
- Click any entry to see its full JSON with syntax highlighting
- LIVE ON/OFF toggle and manual REFRESH button

### Debug Console

- Press `Ctrl+Shift+D` to toggle the debug console panel
- Filter by log level: ALL / DEBUG / INFO / WARN / ERROR / CRITICAL
- Auto-scroll toggle to follow live log entries
- CLEAR button to reset the log buffer

### System Status Bar

Pinned above the debug console, shows:
- Total error count
- Active and critical alert counts
- Live LCP and FCP Core Web Vital readings
- Session UUID prefix
- Session uptime counter

### Triggering Test Errors

In the **Error Tracking** tab:
- **Trigger Test Error** — creates a standard `Error` and routes it through the error tracking pipeline
- **Trigger Critical Error** — triggers a `TypeError` (null property access) logged as CRITICAL

---

## Debugging with VSCode

Open the project in VSCode. The `.vscode/launch.json` provides four configurations:

| Configuration | Purpose |
|--------------|---------|
| Chrome: Debug Enterprise Platform | Launch Chrome with DevTools, mapped to `localhost:3000` |
| Chrome: Attach to Running | Attach debugger to an already-running Chrome instance |
| Node: Debug React Scripts | Run the development server with Node inspector enabled |
| Jest: Run All Tests | Execute the test suite with debugger attached |
| Full Stack (compound) | Starts the dev server AND attaches Chrome in one click |

### Breakpoint Debugging

1. Set a breakpoint in any `src/` file
2. Launch **Chrome: Debug Enterprise Platform**
3. The breakpoint will be hit when the code executes in Chrome

---

## Monitoring Architecture Details

### Event Bus

All monitoring data flows via browser CustomEvents:

```
enterprise:log        Structured log entries
enterprise:error      Error records
enterprise:performance  Web Vital / PerformanceObserver entries
enterprise:business   Simulated business metric ticks
enterprise:alert      New alert created
enterprise:alert:ack  Alert acknowledged
enterprise:alert:resolve  Alert resolved
```

### Metrics Store

Raw data is stored on `window.__METRICS_STORE__` as arrays:
- `errors[]` — capped at 200 entries
- `performance[]` — Web Vitals and resource timing
- `business[]` — simulated KPI ticks
- `alerts[]` — alert lifecycle objects

React hooks subscribe to CustomEvents and call `setState` to trigger re-renders only when data changes.

### Business Metric Simulation

`startBusinessMetricSimulation(4000)` fires every 4 seconds and generates realistic values for all KPIs with controlled variance. It evaluates thresholds on each tick and auto-creates alerts when values exceed SLO limits.

---

## Screenshots

See the `screenshots/` folder. Refer to `screenshots/README.txt` for the list of required captures and instructions on how to take them.

---

## License

MIT
