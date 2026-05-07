import { query } from '../../db/index.js'

function buildRaffleNo(id) {
  return `R${String(id).padStart(6, '0')}`
}

export async function getActivity(req, res) {
  res.json({
    title: '星光抽奖夜',
    subtitle: '输入学号，立即领取你的抽奖编号。',
    privacy: '若中奖，请凭学生证或教务在线首页兑奖。',
  })
}

export async function registerParticipant(req, res) {
  const studentNo = req.body.studentNo?.trim()

  if (!studentNo) {
    return res.status(400).json({ message: '请输入学号' })
  }

  const existing = await query('SELECT raffle_no FROM participants WHERE student_no = $1', [studentNo])
  if (existing.rowCount > 0) {
    return res.json({
      message: '该学号已经参与抽奖，已返回原抽奖编号',
      raffleNo: existing.rows[0].raffle_no,
      alreadyRegistered: true,
    })
  }

  const inserted = await query(
    'INSERT INTO participants (raffle_no, student_no) VALUES ($1, $2) RETURNING id',
    ['PENDING', studentNo],
  )

  const participant = inserted.rows[0]
  const raffleNo = buildRaffleNo(participant.id)

  await query('UPDATE participants SET raffle_no = $1 WHERE id = $2', [raffleNo, participant.id])

  res.status(201).json({
    message: '参与成功',
    raffleNo,
    alreadyRegistered: false,
  })
}

export async function lookupParticipantByStudentNo(req, res) {
  const studentNo = req.body.studentNo?.trim()

  if (!studentNo) {
    return res.status(400).json({ message: '请输入学号' })
  }

  const result = await query('SELECT raffle_no, student_no FROM participants WHERE student_no = $1', [studentNo])

  if (result.rowCount === 0) {
    return res.status(404).json({ message: '该学号暂未参与抽奖，请先完成报名。' })
  }

  res.json({
    message: '查询成功',
    raffleNo: result.rows[0].raffle_no,
    studentNo: result.rows[0].student_no,
  })
}

export async function listParticipants(req, res) {
  const result = await query(
    'SELECT id, raffle_no, student_no, created_at FROM participants ORDER BY id DESC',
    [],
  )

  res.json(result.rows)
}
