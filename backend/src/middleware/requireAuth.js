import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: '未登录' })
  }

  try {
    const token = authHeader.slice(7)
    req.admin = jwt.verify(token, env.jwtSecret)
    next()
  } catch {
    return res.status(401).json({ message: '登录已失效' })
  }
}
