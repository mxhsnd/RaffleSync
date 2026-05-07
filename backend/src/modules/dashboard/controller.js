import { query } from '../../db/index.js'

export async function getDashboard(req, res) {
  const [participants, prizes, winners, claimed] = await Promise.all([
    query('SELECT COUNT(*)::int AS count FROM participants', []),
    query('SELECT COUNT(*)::int AS count FROM prizes', []),
    query('SELECT COUNT(*)::int AS count FROM winner_records', []),
    query('SELECT COUNT(*)::int AS count FROM winner_records WHERE claimed = TRUE', []),
  ])

  res.json({
    participants: participants.rows[0].count,
    prizes: prizes.rows[0].count,
    winners: winners.rows[0].count,
    claimed: claimed.rows[0].count,
  })
}
