import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig, loadEnv } from 'vite'
import handler from './api/send-feedback.js'

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

function adaptResponse(res) {
  const wrapped = {
    statusCode: 200,
    setHeader(name, value) {
      res.setHeader(name, value)
      return wrapped
    },
    status(code) {
      wrapped.statusCode = code
      return wrapped
    },
    json(payload) {
      res.statusCode = wrapped.statusCode
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
      res.end(JSON.stringify(payload))
    },
  }

  return wrapped
}

function feedbackApiMiddleware() {
  return async function feedbackApi(req, res, next) {
    const path = (req.url || '').split('?')[0]
    if (path !== '/api/send-feedback') {
      next()
      return
    }

    try {
      if (req.method === 'POST') {
        req.body = await readRawBody(req)
      }

      await handler(req, adaptResponse(res))
    } catch (error) {
      console.error('Feedback API error:', error)
      if (!res.writableEnded) {
        res.statusCode = 500
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.end(JSON.stringify({
          success: false,
          message: 'Failed to send feedback',
        }))
      }
    }
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const fileEnv = loadEnv(mode, process.cwd(), 'RESEND_')
  if (!process.env.RESEND_API_KEY && fileEnv.RESEND_API_KEY) {
    process.env.RESEND_API_KEY = fileEnv.RESEND_API_KEY
  }

  return {
    plugins: [
      react(),
      babel({ presets: [reactCompilerPreset()] }),
      {
        name: 'feedback-api',
        configureServer(server) {
          server.middlewares.use(feedbackApiMiddleware())
        },
        configurePreviewServer(server) {
          server.middlewares.use(feedbackApiMiddleware())
        },
      },
    ],
    server: {
      watch: {
        ignored: ['**/.preview/**'],
      },
    },
  }
})
