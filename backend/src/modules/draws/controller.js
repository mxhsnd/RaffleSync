import { query } from '../../db/index.js'

function pickRandomItems(items, count) {
  const shuffled = [...items]
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled.slice(0, count)
}

export async function drawWinners(req, res) {
  const { prizeId } = req.body

  if (!prizeId) {
    return res.status(400).json({ message: '缺少奖项' })
  }

  const prizeResult = await query('SELECT * FROM prizes WHERE id = $1', [prizeId])
  const prize = prizeResult.rows[0]

  if (!prize) {
    return res.status(404).json({ message: '奖项不存在' })
  }

  const existingWinners = await query('SELECT COUNT(*)::int AS count FROM winner_records WHERE prize_id = $1', [prizeId])
  const drawnCount = existingWinners.rows[0].count
  const remainingCount = prize.quantity - drawnCount

  if (remainingCount <= 0) {
    return res.status(400).json({ message: '该奖项已抽完' })
  }

  const candidateResult = await query(
    `SELECT p.id, p.raffle_no, p.student_no
     FROM participants p
     WHERE NOT EXISTS (
       SELECT 1 FROM winner_records w WHERE w.participant_id = p.id
     )
     ORDER BY p.id ASC`,
    [],
  )

  if (candidateResult.rowCount === 0) {
    return res.status(400).json({ message: '没有可抽取的参与者' })
  }

  const winners = pickRandomItems(candidateResult.rows, remainingCount)

  for (const winner of winners) {
    await query(
      'INSERT INTO winner_records (participant_id, prize_id, raffle_no, nickname) VALUES ($1, $2, $3, $4)',
      [winner.id, prize.id, winner.raffle_no, null],
    )
  }

  res.json({
    prize,
    winners,
  })
}

export async function listWinners(req, res) {
  const result = await query(
    `SELECT w.id, w.raffle_no, w.claimed, w.claimed_at, w.created_at, p.name AS prize_name
     FROM winner_records w
     JOIN prizes p ON p.id = w.prize_id
     ORDER BY w.id DESC`,
    [],
  )

  res.json(result.rows)
}
