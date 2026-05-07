import { query } from '../../db/index.js'

function buildRaffleNo(id) {
  return `R${String(id).padStart(6, '0')}`
}

export async function getActivity(req, res) {
  res.json({
    title: '星光抽奖夜',
    subtitle: '扫码登记，领取专属编号，等待幸运降临。',
    privacy: '学号和姓名仅用于中奖后的身份核验，不用于公开展示。',
  })
}

export async function registerParticipant(req, res) {
  const { nickname, studentNo, realName } = req.body

  if (!nickname || !studentNo || !realName) {
    return res.status(400).json({ message: '请完整填写信息' })
  }

  const existing = await query('SELECT raffle_no FROM participants WHERE student_no = $1', [studentNo])
  if (existing.rowCount > 0) {
    return res.status(409).json({ message: '该学号已报名', raffleNo: existing.rows[0].raffle_no })
  }

  const inserted = await query(
    'INSERT INTO participants (raffle_no, nickname, student_no, real_name) VALUES ($1, $2, $3, $4) RETURNING id, raffle_no, nickname',
    ['PENDING', nickname.trim(), studentNo.trim(), realName.trim()],
  )

  const participant = inserted.rows[0]
  const raffleNo = buildRaffleNo(participant.id)

  await query('UPDATE participants SET raffle_no = $1 WHERE id = $2', [raffleNo, participant.id])

  res.status(201).json({
    message: '报名成功',
    raffleNo,
    nickname: participant.nickname,
  })
}

export async function listParticipants(req, res) {
  const result = await query(
    'SELECT id, raffle_no, nickname, student_no, real_name, created_at FROM participants ORDER BY id DESC',
    [],
  )

  res.json(result.rows)
}
