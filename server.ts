import express from 'express';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { createServer as createViteServer } from 'vite';
import {
  authenticateStudent,
  createSession as _createSession,
  deleteSession,
  getStudentByToken,
  listAllPublicStudents,
  registerStudent,
  updateStudentProfile,
} from './server/storage';
import {
  validateLoginInput,
  validateProfileUpdate,
  validateRegisterInput,
} from './src/utils/studentLogic';

const PORT = Number(process.env.PORT ?? 3000);
const SESSION_COOKIE = 'rowad_session';

function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!cookieHeader) return out;
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const val = decodeURIComponent(part.slice(idx + 1).trim());
    if (key) out[key] = val;
  }
  return out;
}

function extractToken(req: express.Request): string {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  const cookies = parseCookies(req.headers.cookie);
  return cookies[SESSION_COOKIE] ?? '';
}

function setSessionCookie(res: express.Response, token: string): void {
  res.setHeader(
    'Set-Cookie',
    `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`,
  );
}

function clearSessionCookie(res: express.Response): void {
  res.setHeader(
    'Set-Cookie',
    `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
  );
}

async function startServer() {
  const app = express();
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.post('/api/auth/register', (req, res) => {
    const body = req.body ?? {};
    const input = {
      fullName: String(body.fullName ?? ''),
      email: String(body.email ?? ''),
      studentCode: body.studentCode ? String(body.studentCode) : undefined,
      grade: String(body.grade ?? ''),
      section: String(body.section ?? ''),
      track: String(body.track ?? ''),
      guardianPhone: String(body.guardianPhone ?? ''),
      city: String(body.city ?? ''),
      notes: body.notes ? String(body.notes) : '',
      password: String(body.password ?? ''),
      confirmPassword: String(body.confirmPassword ?? ''),
    };

    const validation = validateRegisterInput(input);
    if (!validation.valid) {
      res.status(400).json({
        error: 'يرجى التحقق من الحقول المطلوبة.',
        fieldErrors: validation.errors,
      });
      return;
    }

    const result = registerStudent(input);
    if (!result.ok) {
      res.status(409).json({
        error: result.error,
        fieldErrors: result.field ? { [result.field]: result.error } : {},
      });
      return;
    }

    setSessionCookie(res, result.token);
    res.status(201).json({
      student: result.student,
      token: result.token,
    });
  });

  app.post('/api/auth/login', (req, res) => {
    const body = req.body ?? {};
    const input = {
      identifier: String(body.identifier ?? ''),
      password: String(body.password ?? ''),
    };

    const validation = validateLoginInput(input);
    if (!validation.valid) {
      res.status(400).json({
        error: 'يرجى إدخال بيانات تسجيل الدخول كاملة.',
        fieldErrors: validation.errors,
      });
      return;
    }

    const result = authenticateStudent(input.identifier, input.password);
    if (!result.ok) {
      res.status(401).json({ error: result.error });
      return;
    }

    setSessionCookie(res, result.token);
    res.json({
      student: result.student,
      token: result.token,
    });
  });

  app.post('/api/auth/logout', (req, res) => {
    const token = extractToken(req);
    deleteSession(token);
    clearSessionCookie(res);
    res.json({ ok: true });
  });

  app.get('/api/auth/me', (req, res) => {
    const token = extractToken(req);
    const student = getStudentByToken(token);
    res.json({ student: student ?? null });
  });

  app.put('/api/students/me', (req, res) => {
    const token = extractToken(req);
    const current = getStudentByToken(token);
    if (!current) {
      res.status(401).json({ error: 'غير مصرح. يرجى تسجيل الدخول.' });
      return;
    }

    const body = req.body ?? {};
    const updates = {
      fullName: String(body.fullName ?? ''),
      grade: String(body.grade ?? ''),
      section: String(body.section ?? ''),
      track: String(body.track ?? ''),
      guardianPhone: String(body.guardianPhone ?? ''),
      city: String(body.city ?? ''),
      notes: String(body.notes ?? ''),
    };

    const validation = validateProfileUpdate(updates);
    if (!validation.valid) {
      res.status(400).json({
        error: 'يرجى تصحيح البيانات المدخلة.',
        fieldErrors: validation.errors,
      });
      return;
    }

    const updated = updateStudentProfile(current.id, updates);
    if (!updated) {
      res.status(404).json({ error: 'لم يتم العثور على سجل الطالب.' });
      return;
    }

    res.json({ student: updated });
  });

  app.get('/api/students', (req, res) => {
    const token = extractToken(req);
    const current = getStudentByToken(token);
    if (!current) {
      res.status(401).json({ error: 'غير مصرح. يرجى تسجيل الدخول.' });
      return;
    }
    res.json({ students: listAllPublicStudents() });
  });

  const isProd = process.env.NODE_ENV === 'production';
  const distPath = path.resolve(process.cwd(), 'dist');

  const httpServer = http.createServer(app);

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false, ws: { server: httpServer } },
      appType: 'spa',
    });

    // HMR is disabled in AI Studio: prevent @vite/client from opening a failing WebSocket
    app.use('/@vite/client', (req, res, next) => {
      delete req.headers['if-none-match'];
      delete req.headers['if-modified-since'];
      const chunks: Buffer[] = [];
      const origWrite = res.write.bind(res);
      const origEnd = res.end.bind(res);
      let isRedirectOrError = false;

      res.write = ((chunk: Buffer | string, ...args: unknown[]) => {
        if (res.statusCode !== 200) {
          isRedirectOrError = true;
          return (origWrite as (...a: unknown[]) => boolean)(chunk, ...args);
        }
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        return true;
      }) as typeof res.write;

      res.end = ((chunk?: Buffer | string, ...args: unknown[]) => {
        if (isRedirectOrError || res.statusCode !== 200) {
          return (origEnd as (...a: unknown[]) => typeof res)(chunk, ...args);
        }
        if (chunk) {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        }
        const body = Buffer.concat(chunks)
          .toString('utf-8')
          .replace(
            'const socketHost = `${null || importMetaUrl.hostname}:${hmrPort || importMetaUrl.port}${"/"}`;',
            'const socketHost = `${importMetaUrl.host}/`;',
          )
          .replace(
            'console.error(`[vite] failed to connect to websocket.your current setup:',
            'console.debug(`[vite] websocket unavailable:',
          )
          .replace(
            'console.error(`[vite] failed to connect to websocket (${e}). `);\n\t\t\t\tthrow e;',
            'return;',
          )
          .replace(
            'this.transport.send(payload).catch((err) => {\n\t\t\tthis.logger.error(err);\n\t\t});',
            'this.transport.send(payload).catch(() => {});',
          );
        res.removeHeader('ETag');
        res.setHeader('Content-Length', Buffer.byteLength(body));
        return origEnd(body);
      }) as typeof res.end;

      next();
    });

    app.use(vite.middlewares);
  } else if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Rowad Al-Alam Student Platform running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
