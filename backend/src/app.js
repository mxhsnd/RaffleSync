import express from 'express'
import cors from 'cors'
import { login } from './modules/auth/controller.js'
import { getActivity, listParticipants, lookupParticipantByStudentNo, registerParticipant } from './modules/participants/controller.js'
import { createPrize, listPrizes } from './modules/prizes/controller.js'
import { drawWinners, listWinners } from './modules/draws/controller.js'
import { verifyClaim, confirmClaim } from './modules/claims/controller.js'
import { getDashboard } from './modules/dashboard/controller.js'
import { requireAuth } from './middleware/requireAuth.js'

export function createApp() {
  const app = express()

  app.use(cors())
  app.use(express.json())

  app.get('/api/health', (req, res) => res.json({ ok: true }))
  app.get('/api/public/activity', getActivity)
  app.post('/api/public/register', registerParticipant)
  app.post('/api/public/lookup', lookupParticipantByStudentNo)
  app.post('/api/auth/login', login)

  app.get('/api/admin/dashboard', requireAuth, getDashboard)
  app.get('/api/admin/participants', requireAuth, listParticipants)
  app.get('/api/admin/prizes', requireAuth, listPrizes)
  app.post('/api/admin/prizes', requireAuth, createPrize)
  app.post('/api/admin/draw', requireAuth, drawWinners)
  app.get('/api/admin/winners', requireAuth, listWinners)
  app.post('/api/admin/claims/verify', requireAuth, verifyClaim)
  app.post('/api/admin/claims/confirm', requireAuth, confirmClaim)

  app.use((error, req, res, next) => {
    console.error(error)
    res.status(500).json({ message: '服务器内部错误' })
  })

  return app
}
