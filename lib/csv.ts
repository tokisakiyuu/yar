import * as csv from 'fast-csv'

export async function csvToJson(raw: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const result: any[] = []
    csv.parseString(raw, { headers: true })
      .on('error', reject)
      .on('data', (row: any) => result.push(row))
      .on('end', () => resolve(result))
  })
}

export async function jsonToCsv(json: any[]): Promise<string> {
  return new Promise((resovle, reject) => {
    const lines: string[] = []
    const stream = csv.format({ headers: true })
    stream.on('data', line => lines.push(Buffer.from(line).toString('utf-8')))
    stream.on('error', reject)
    stream.on('end', () => resovle(lines.join('')))
    json.forEach(row => stream.write(row))
    stream.end()
  })
}