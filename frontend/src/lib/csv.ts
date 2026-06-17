export type CsvRow = Record<string, unknown>
export type ParsedCsvRow = Record<string, string>

function escapeCsv(value: unknown) {
  const text = value == null ? '' : Array.isArray(value) ? value.join('|') : String(value)
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export function downloadCsv(filename: string, rows: CsvRow[]) {
  if (rows.length === 0) return
  const headers = Object.keys(rows[0])
  const csv = [headers.join(','), ...rows.map((row) => headers.map((header) => escapeCsv(row[header])).join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function parseCsv(text: string): ParsedCsvRow[] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]
    const next = text[i + 1]
    if (char === '"') {
      if (quoted && next === '"') {
        cell += '"'
        i += 1
      } else {
        quoted = !quoted
      }
    } else if (char === ',' && !quoted) {
      row.push(cell.trim())
      cell = ''
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && next === '\n') i += 1
      row.push(cell.trim())
      if (row.some(Boolean)) rows.push(row)
      row = []
      cell = ''
    } else {
      cell += char
    }
  }
  row.push(cell.trim())
  if (row.some(Boolean)) rows.push(row)
  const headers = rows.shift()?.map((header) => header.trim()) ?? []
  return rows.map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ''])))
}

export function splitList(value: string | undefined) {
  return value ? value.split(/[|;]/).map((item) => item.trim()).filter(Boolean) : []
}
