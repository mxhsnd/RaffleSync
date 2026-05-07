import { query } from '../../db/index.js'

const ticketThemes = ['aurora', 'retro', 'minimal', 'festival', 'blueprint']

function normalizeTheme(theme) {
  return ticketThemes.includes(theme) ? theme : 'aurora'
}

export async function getPublicSettings(req, res) {
  const result = await query('SELECT ticket_theme FROM site_settings WHERE id = 1')
  const ticketTheme = normalizeTheme(result.rows[0]?.ticket_theme)
  res.json({ ticketTheme })
}

export async function getAdminSettings(req, res) {
  const result = await query('SELECT ticket_theme FROM site_settings WHERE id = 1')
  const ticketTheme = normalizeTheme(result.rows[0]?.ticket_theme)
  res.json({ ticketTheme, ticketThemes })
}

export async function updateAdminSettings(req, res) {
  const ticketTheme = normalizeTheme(req.body.ticketTheme)

  if (!req.body.ticketTheme || ticketTheme !== req.body.ticketTheme) {
    return res.status(400).json({ message: '无效的票据主题' })
  }

  await query(
    `INSERT INTO site_settings (id, ticket_theme, updated_at)
     VALUES (1, $1, CURRENT_TIMESTAMP)
     ON CONFLICT (id)
     DO UPDATE SET ticket_theme = EXCLUDED.ticket_theme, updated_at = CURRENT_TIMESTAMP`,
    [ticketTheme],
  )

  res.json({ message: '票据主题已更新', ticketTheme, ticketThemes })
}
