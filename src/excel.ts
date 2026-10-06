export interface ExcelSheet {
  name: string
  columns: string[]
  rows: string[][]
}

const xmlEscape = (value: string): string => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&apos;')

const columnName = (index: number): string => {
  let value = index + 1
  let result = ''
  while (value > 0) {
    const remainder = (value - 1) % 26
    result = String.fromCharCode(65 + remainder) + result
    value = Math.floor((value - 1) / 26)
  }
  return result
}

const sheetXml = (sheet: ExcelSheet): string => {
  const allRows = [sheet.columns, ...sheet.rows]
  const maxColumn = Math.max(1, ...allRows.map((row) => row.length))
  const maxRow = Math.max(1, allRows.length)
  const rows = allRows.map((row, rowIndex) => {
    const cells = Array.from({ length: maxColumn }, (_, columnIndex) => {
      const value = row[columnIndex] ?? ''
      if (value === '') return ''
      const style = rowIndex === 0 ? ' s="1"' : ''
      return `<c r="${columnName(columnIndex)}${rowIndex + 1}" t="inlineStr"${style}><is><t xml:space="preserve">${xmlEscape(value)}</t></is></c>`
    }).join('')
    return `<row r="${rowIndex + 1}">${cells}</row>`
  }).join('')
  const widths = Array.from({ length: maxColumn }, (_, index) => `<col min="${index + 1}" max="${index + 1}" width="18" customWidth="1"/>`).join('')
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><dimension ref="A1:${columnName(maxColumn - 1)}${maxRow}"/><sheetViews><sheetView workbookViewId="0" showGridLines="0"/></sheetViews><cols>${widths}</cols><sheetData>${rows}</sheetData></worksheet>`
}

const crcTable = (() => {
  const table = new Uint32Array(256)
  for (let index = 0; index < 256; index += 1) {
    let value = index
    for (let bit = 0; bit < 8; bit += 1) value = (value & 1) ? (value >>> 1) ^ 0xedb88320 : value >>> 1
    table[index] = value >>> 0
  }
  return table
})()

const crc32 = (data: Uint8Array): number => {
  let value = 0xffffffff
  for (const byte of data) value = (value >>> 8) ^ (crcTable[(value ^ byte) & 0xff] ?? 0)
  return (value ^ 0xffffffff) >>> 0
}

const littleEndian16 = (value: number): number[] => [value & 0xff, (value >>> 8) & 0xff]
const littleEndian32 = (value: number): number[] => [value & 0xff, (value >>> 8) & 0xff, (value >>> 16) & 0xff, (value >>> 24) & 0xff]
const joinBytes = (parts: Uint8Array[]): Uint8Array => {
  const total = parts.reduce((sum, part) => sum + part.length, 0)
  const result = new Uint8Array(total)
  let offset = 0
  for (const part of parts) { result.set(part, offset); offset += part.length }
  return result
}

const zipStore = (files: Array<{ name: string; body: string }>): Uint8Array => {
  const encoder = new TextEncoder()
  const locals: Uint8Array[] = []
  const centrals: Uint8Array[] = []
  let offset = 0
  for (const file of files) {
    const name = encoder.encode(file.name)
    const body = encoder.encode(file.body)
    const crc = crc32(body)
    const localHeader = new Uint8Array([
      0x50, 0x4b, 0x03, 0x04, ...littleEndian16(20), 0, 0, 0, 0, 0, 0, 0, 0,
      ...littleEndian32(crc), ...littleEndian32(body.length), ...littleEndian32(body.length),
      ...littleEndian16(name.length), 0, 0,
    ])
    const local = joinBytes([localHeader, name, body])
    locals.push(local)
    const centralHeader = new Uint8Array([
      0x50, 0x4b, 0x01, 0x02, ...littleEndian16(20), ...littleEndian16(20), 0, 0, 0, 0, 0, 0, 0, 0,
      ...littleEndian32(crc), ...littleEndian32(body.length), ...littleEndian32(body.length),
      ...littleEndian16(name.length), 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ...littleEndian32(offset),
    ])
    centrals.push(joinBytes([centralHeader, name]))
    offset += local.length
  }
  const localBytes = joinBytes(locals)
  const centralBytes = joinBytes(centrals)
  const end = new Uint8Array([
    0x50, 0x4b, 0x05, 0x06, 0, 0, 0, 0,
    ...littleEndian16(files.length), ...littleEndian16(files.length),
    ...littleEndian32(centralBytes.length), ...littleEndian32(localBytes.length), 0, 0,
  ])
  return joinBytes([localBytes, centralBytes, end])
}

export const buildExcelWorkbook = (sheets: ExcelSheet[]): Uint8Array => {
  const safeSheets = sheets.length > 0 ? sheets.slice(0, 20) : [{ name: '데이터', columns: ['내용'], rows: [] }]
  const sheetEntries = safeSheets.map((sheet, index) => ({
    name: sheet.name.slice(0, 31),
    id: index + 1,
    path: `xl/worksheets/sheet${index + 1}.xml`,
  }))
  const files = [
    { name: '[Content_Types].xml', body: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${sheetEntries.map((sheet) => `<Override PartName="/${sheet.path}" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')}</Types>` },
    { name: '_rels/.rels', body: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>` },
    { name: 'xl/workbook.xml', body: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${sheetEntries.map((sheet) => `<sheet name="${xmlEscape(sheet.name)}" sheetId="${sheet.id}" r:id="rId${sheet.id}"/>`).join('')}</sheets></workbook>` },
    { name: 'xl/_rels/workbook.xml.rels', body: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheetEntries.map((sheet) => `<Relationship Id="rId${sheet.id}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${sheet.id}.xml"/>`).join('')}<Relationship Id="rId${sheetEntries.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>` },
    { name: 'xl/styles.xml', body: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="10"/><name val="Arial"/></font><font><b/><sz val="10"/><name val="Arial"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="D9EAF2"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" applyAlignment="1"><alignment wrapText="1" vertical="top"/></xf></cellXfs></styleSheet>` },
    ...safeSheets.map((sheet, index) => ({ name: `xl/worksheets/sheet${index + 1}.xml`, body: sheetXml(sheet) })),
  ]
  return zipStore(files)
}

export const excelResponse = (filename: string, sheets: ExcelSheet[]): Response => new Response(buildExcelWorkbook(sheets) as unknown as BodyInit, {
  status: 200,
  headers: {
    'content-type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'content-disposition': `attachment; filename="recruitment.xlsx"; filename*=UTF-8''${encodeURIComponent(filename)}`,
    'cache-control': 'no-store',
  },
})
