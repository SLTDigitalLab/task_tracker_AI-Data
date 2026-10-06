const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const PORT = process.env.PORT || 5001;
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/documents', require('./routes/documentRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Serve uploads statically
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Root route: Interactive Backend Status & API Explorer Dashboard
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>SLT BA Tracker - Backend API</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        body { background: linear-gradient(135deg, #e0f2fe 0%, #f0fdf4 50%, #e6f9f5 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; color: #0f172a; }
        .card { background: rgba(255, 255, 255, 0.92); backdrop-filter: blur(16px); border: 1px solid rgba(186, 230, 253, 0.8); border-radius: 24px; padding: 36px; max-width: 680px; width: 100%; box-shadow: 0 20px 40px -15px rgba(14, 116, 144, 0.12); }
        .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #e0f2fe; padding-bottom: 20px; margin-bottom: 24px; }
        .badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 700; background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }
        .badge::before { content: ""; width: 8px; height: 8px; border-radius: 50%; background: #22c55e; animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        h1 { font-size: 22px; font-weight: 800; color: #0369a1; letter-spacing: -0.02em; }
        p.desc { font-size: 14px; color: #64748b; margin-top: 4px; }
        .buttons { display: flex; gap: 12px; margin-bottom: 28px; flex-wrap: wrap; }
        .btn { flex: 1; min-width: 200px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 12px 20px; border-radius: 12px; font-weight: 600; font-size: 14px; text-decoration: none; transition: all 0.2s; }
        .btn-primary { background: #0284c7; color: white; box-shadow: 0 4px 12px rgba(2, 132, 199, 0.25); }
        .btn-primary:hover { background: #0369a1; transform: translateY(-1px); }
        .btn-secondary { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
        .btn-secondary:hover { background: #dcfce7; transform: translateY(-1px); }
        .section-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; margin-bottom: 12px; }
        .endpoints { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; divide-y: 1px solid #e2e8f0; overflow: hidden; }
        .endpoint-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 16px; font-size: 13px; border-bottom: 1px solid #e2e8f0; }
        .endpoint-row:last-child { border-bottom: none; }
        .method { font-size: 11px; font-weight: 800; padding: 2px 8px; border-radius: 6px; }
        .get { background: #e0f2fe; color: #0369a1; }
        .post { background: #dcfce7; color: #15803d; }
        .patch { background: #fef3c7; color: #b45309; }
        .path { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-weight: 600; color: #334155; }
        .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 24px; padding-top: 20px; border-top: 1px solid #e0f2fe; font-size: 12px; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div>
            <h1>SLT BA Tracker API</h1>
            <p class="desc">Express.js & PostgreSQL Backend Service</p>
          </div>
          <span class="badge">Online (Port ${PORT})</span>
        </div>

        <div class="buttons">
          <a href="http://localhost:5173" class="btn btn-primary" target="_blank">
            🖥️ Open Frontend App (Port 5173)
          </a>
          <a href="http://localhost:5555" class="btn btn-secondary" target="_blank">
            🗄️ Open Visual Database (Prisma Studio)
          </a>
        </div>

        <div class="section-title">Available REST API Endpoints</div>
        <div class="endpoints">
          <div class="endpoint-row">
            <div><span class="method post">POST</span> <span class="path">/api/auth/login</span></div>
            <span style="color: #64748b;">User Sign In</span>
          </div>
          <div class="endpoint-row">
            <div><span class="method post">POST</span> <span class="path">/api/auth/register</span></div>
            <span style="color: #64748b;">BA Registration (INSP Number)</span>
          </div>
          <div class="endpoint-row">
            <div><span class="method get">GET</span> <span class="path">/api/projects</span></div>
            <span style="color: #64748b;">Project Listing</span>
          </div>
          <div class="endpoint-row">
            <div><span class="method get">GET</span> <span class="path">/api/tasks</span></div>
            <span style="color: #64748b;">Task Management</span>
          </div>
          <div class="endpoint-row">
            <div><span class="method get">GET</span> <span class="path">/api/documents</span></div>
            <span style="color: #64748b;">Document Categories (BRD, Flow, UAT)</span>
          </div>
          <div class="endpoint-row">
            <div><span class="method get">GET</span> <span class="path">/api/documents/:id/history</span></div>
            <span style="color: #64748b;">Submission Audit Trail</span>
          </div>
          <div class="endpoint-row">
            <div><span class="method get">GET</span> <span class="path">/api/notifications</span></div>
            <span style="color: #64748b;">Real-time Alerts</span>
          </div>
        </div>

        <div class="info-grid">
          <div><strong>Database:</strong> PostgreSQL (Local 'ba_tracker')</div>
          <div><strong>ORM:</strong> Prisma 5.22</div>
          <div><strong>Node Version:</strong> ${process.version}</div>
          <div><strong>Server Uptime:</strong> ${Math.floor(process.uptime())}s</div>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
