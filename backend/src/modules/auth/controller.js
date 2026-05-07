import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { env } from '../../config/env.js'

const adminPasswordHash = bcrypt.hashSync(env.adminPassword, 10)

export async function login(req, res) {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ message: '请输入账号和密码' })
  }

  if (username !== env.adminUsername) {
    return res.status(401).json({ message: '账号或密码错误' })
  }

  const matched = await bcrypt.compare(password, adminPasswordHash)
  if (!matched) {
    return res.status(401).json({ message: '账号或密码错误' })
  }

  const token = jwt.sign({ username }, env.jwtSecret, { expiresIn: '12h' })
  res.json({ token, username })
}
