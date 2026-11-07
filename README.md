# Budget Tracker

Track daily, weekly and monthly spending by category. A small Node.js server stores
everything in a SQLite database and serves the app to your phone and computer.

## Run it

```
npm install
npm start
```

The server prints the addresses to open and the passcode:

- **On this computer:** http://localhost:3000
- **On your phone:** the `http://192.168.x.x:3000` address, with the phone on the same Wi-Fi.
  The first time you start it, Windows asks whether Node.js may use the network: allow **Private networks**.

Each browser asks for the passcode once. The passcode is generated on first run and kept in
`data/passcode.txt`. Set the `BUDGET_PASSCODE` environment variable to choose your own.

## Your data

- Database: `data/budget.db` (SQLite). To back it up, copy the `data/` folder while the server is stopped,
  or use **Settings → Back up everything** in the app.
- The app keeps a copy on each device. Expenses added offline are queued and uploaded when the
  device reconnects. The dot at the top of the app shows the sync state.
- Opened without the server (as a plain file or with Live Server), the app still works but
  saves only in that browser.

## Settings

| Variable          | Default   | Purpose                                          |
|-------------------|-----------|--------------------------------------------------|
| `PORT`            | `3000`    | Port to listen on                                |
| `HOST`            | `0.0.0.0` | Interface to bind (`127.0.0.1` = this PC only)   |
| `BUDGET_PASSCODE` | generated | Passcode required by the app                     |
| `DATA_DIR`        | `./data`  | Where the database and passcode file live        |
| `TRUST_PROXY`     | unset     | Set when running behind a hosting proxy (HTTPS)  |

## Layout

- `server.js`: API routes, validation, passcode check
- `db.js`: SQLite schema, migrations and queries
- `public/`: the app (HTML/CSS/JS), service worker and install manifest
