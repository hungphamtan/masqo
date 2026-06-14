import { describe, it, expect } from 'vitest'
import { detectDatabaseSecrets } from './database.js'

describe('Database Connection String Detector', () => {
  it('detects PostgreSQL connection string', () => {
    const input = 'postgresql://admin:secret123@localhost:5432/mydb'
    const result = detectDatabaseSecrets(input)
    expect(result.some((d) => d.type === 'database-connection-string')).toBe(true)
  })

  it('detects postgres:// variant', () => {
    const input = 'postgres://user:pass@db.example.com/mydb'
    const result = detectDatabaseSecrets(input)
    expect(result.some((d) => d.type === 'database-connection-string')).toBe(true)
  })

  it('detects MySQL connection string', () => {
    const input = 'mysql://admin:secret@localhost:3306/db'
    const result = detectDatabaseSecrets(input)
    expect(result.some((d) => d.type === 'database-connection-string')).toBe(true)
  })

  it('detects MongoDB connection string', () => {
    const input = 'mongodb://user:pass@host:27017/db'
    const result = detectDatabaseSecrets(input)
    expect(result.some((d) => d.type === 'database-connection-string')).toBe(true)
  })

  it('detects mongodb+srv connection string', () => {
    const input = 'mongodb+srv://user:pass@cluster.mongodb.net/db'
    const result = detectDatabaseSecrets(input)
    expect(result.some((d) => d.type === 'database-connection-string')).toBe(true)
  })

  it('detects Redis URL', () => {
    const input = 'redis://:password@localhost:6379/0'
    const result = detectDatabaseSecrets(input)
    expect(result.some((d) => d.type === 'database-connection-string')).toBe(true)
  })

  it('detects Sentry DSN', () => {
    const input = 'https://abc123def456abc123def456abc12345@o123456.ingest.sentry.io/7890123'
    const result = detectDatabaseSecrets(input)
    expect(result.some((d) => d.type === 'sentry-dsn')).toBe(true)
  })

  it('does not flag connection strings without credentials', () => {
    const input = 'postgresql://localhost:5432/mydb'
    const result = detectDatabaseSecrets(input)
    expect(result).toHaveLength(0)
  })

  it('includes source attribution', () => {
    const result = detectDatabaseSecrets('postgresql://admin:secret@localhost/db')
    expect(result[0]?.source).toBe('detector:secrets/database')
  })

  it('returns correct position covering the full URL', () => {
    const prefix = 'DATABASE_URL='
    const url = 'postgresql://admin:secret@localhost/db'
    const input = `${prefix}${url}`
    const result = detectDatabaseSecrets(input)
    expect(result[0]?.position.start).toBe(prefix.length)
    expect(input.slice(result[0]!.position.start, result[0]!.position.end)).toContain('secret')
  })
})
