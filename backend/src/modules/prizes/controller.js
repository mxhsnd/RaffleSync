import { query } from '../../db/index.js'

export async function createPrize(req, res) {
  const { name, quantity, description = '' } = req.body

  if (!name || !quantity || Number(quantity) <= 0) {
    return res.status(400).json({ message: '奖项信息不完整' })
  }

  const result = await query(
    'INSERT INTO prizes (name, quantity, description) VALUES ($1, $2, $3) RETURNING *',
    [name.trim(), Number(quantity), description.trim()],
  )

  res.status(201).json(result.rows[0])
}

export async function listPrizes(req, res) {
  const result = await query(
    `SELECT p.*, COALESCE(w.win_count, 0) AS win_count
     FROM prizes p
     LEFT JOIN (
       SELECT prize_id, COUNT(*)::int AS win_count
       FROM winner_records
       GROUP BY prize_id
     ) w ON w.prize_id = p.id
     ORDER BY p.id ASC`,
    [],
  )

  res.json(result.rows)
}
