import { query } from '../../db/index.js'

export async function verifyClaim(req, res) {
  const { raffleNo } = req.body

  if (!raffleNo) {
    return res.status(400).json({ message: '请输入编号' })
  }

  const result = await query(
    `SELECT w.id AS winner_id, w.claimed, p.raffle_no, p.student_no, pr.name AS prize_name
     FROM winner_records w
     JOIN participants p ON p.id = w.participant_id
     JOIN prizes pr ON pr.id = w.prize_id
     WHERE p.raffle_no = $1`,
    [raffleNo.trim()],
  )

  if (result.rowCount === 0) {
    return res.status(404).json({ message: '未找到中奖记录' })
  }

  res.json(result.rows[0])
}

export async function confirmClaim(req, res) {
  const { winnerId } = req.body

  if (!winnerId) {
    return res.status(400).json({ message: '缺少中奖记录' })
  }

  const result = await query(
    'UPDATE winner_records SET claimed = TRUE, claimed_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
    [winnerId],
  )

  if (result.rowCount === 0) {
    return res.status(404).json({ message: '中奖记录不存在' })
  }

  res.json({ message: '兑奖成功', record: result.rows[0] })
}
