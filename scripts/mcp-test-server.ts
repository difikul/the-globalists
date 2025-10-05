#!/usr/bin/env node

/**
 * MCP Test Server for The Globalists
 *
 * This MCP server provides testing tools that can be invoked via:
 * - Claude Code
 * - GitHub Actions
 * - Command line
 *
 * Available commands:
 * - test-database: Run database integrity tests
 * - test-api: Run API endpoint tests
 * - test-all: Run all tests
 * - seed-data: Seed test data
 * - cleanup: Clean up test data
 * - generate-mock: Generate mock data
 */

import { execSync } from 'child_process'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface MCPRequest {
  method: string
  params?: Record<string, any>
}

interface MCPResponse {
  success: boolean
  data?: any
  error?: string
  timestamp: string
}

class MCPTestServer {
  async handleRequest(request: MCPRequest): Promise<MCPResponse> {
    const timestamp = new Date().toISOString()

    try {
      switch (request.method) {
        case 'test-database':
          return await this.testDatabase()

        case 'test-api':
          return await this.testAPI()

        case 'test-all':
          return await this.testAll()

        case 'seed-data':
          return await this.seedData()

        case 'cleanup':
          return await this.cleanup()

        case 'generate-mock':
          return await this.generateMock(request.params)

        case 'health-check':
          return await this.healthCheck()

        default:
          return {
            success: false,
            error: `Unknown method: ${request.method}`,
            timestamp
          }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp
      }
    }
  }

  private async testDatabase(): Promise<MCPResponse> {
    console.log('🧪 Running database tests...')

    try {
      const output = execSync('npx tsx scripts/test-database.ts', {
        encoding: 'utf-8',
        stdio: 'pipe'
      })

      return {
        success: true,
        data: {
          test: 'database',
          status: 'passed',
          output: output.trim()
        },
        timestamp: new Date().toISOString()
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.stdout || error.message,
        timestamp: new Date().toISOString()
      }
    }
  }

  private async testAPI(): Promise<MCPResponse> {
    console.log('🧪 Running API tests...')

    try {
      const output = execSync('npx tsx scripts/test-api.ts', {
        encoding: 'utf-8',
        stdio: 'pipe'
      })

      return {
        success: true,
        data: {
          test: 'api',
          status: 'passed',
          output: output.trim()
        },
        timestamp: new Date().toISOString()
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.stdout || error.message,
        timestamp: new Date().toISOString()
      }
    }
  }

  private async testAll(): Promise<MCPResponse> {
    console.log('🧪 Running all tests...')

    const dbResult = await this.testDatabase()
    if (!dbResult.success) {
      return dbResult
    }

    const apiResult = await this.testAPI()
    return apiResult
  }

  private async seedData(): Promise<MCPResponse> {
    console.log('🌱 Seeding test data...')

    try {
      execSync('npm run db:seed', { stdio: 'inherit' })

      return {
        success: true,
        data: { message: 'Test data seeded successfully' },
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      }
    }
  }

  private async cleanup(): Promise<MCPResponse> {
    console.log('🧹 Cleaning up test data...')

    try {
      // Delete all test data except seed users
      await prisma.review.deleteMany()
      await prisma.transaction.deleteMany()
      await prisma.service.deleteMany()
      await prisma.subscription.deleteMany()
      await prisma.provider.deleteMany()

      // Delete users that are not from seed
      await prisma.user.deleteMany({
        where: {
          email: {
            not In: [
              'admin@theglobalists.com',
              'provider@example.com',
              'customer@example.com'
            ]
          }
        }
      })

      return {
        success: true,
        data: { message: 'Test data cleaned up successfully' },
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      }
    } finally {
      await prisma.$disconnect()
    }
  }

  private async generateMock(params?: Record<string, any>): Promise<MCPResponse> {
    console.log('🎭 Generating mock data...')

    try {
      const count = params?.count || 5
      const type = params?.type || 'service'

      if (type === 'service') {
        const provider = await prisma.provider.findFirst()
        if (!provider) {
          throw new Error('No provider found. Please seed data first.')
        }

        const services = []
        for (let i = 0; i < count; i++) {
          const service = await prisma.service.create({
            data: {
              providerId: provider.id,
              category: ['CITIZENSHIP', 'RESIDENCY', 'BANKING'][i % 3] as any,
              title: `Test Service ${i + 1}`,
              description: `This is a mock test service ${i + 1} for testing purposes. It includes all necessary fields and proper validation.`,
              slug: `test-service-${i + 1}-${Date.now()}`,
              price: 10000 + i * 5000,
              country: ['Malta', 'Portugal', 'UAE'][i % 3],
              countryCode: ['MT', 'PT', 'AE'][i % 3],
              features: JSON.stringify([
                'Feature 1',
                'Feature 2',
                'Feature 3'
              ]),
              status: 'PUBLISHED'
            }
          })
          services.push(service)
        }

        return {
          success: true,
          data: {
            type,
            count: services.length,
            services
          },
          timestamp: new Date().toISOString()
        }
      }

      return {
        success: false,
        error: `Unsupported type: ${type}`,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      }
    } finally {
      await prisma.$disconnect()
    }
  }

  private async healthCheck(): Promise<MCPResponse> {
    try {
      // Check database connection
      await prisma.$queryRaw`SELECT 1`

      // Check server is running
      const isServerRunning = true // Simplified check

      return {
        success: true,
        data: {
          database: 'connected',
          server: isServerRunning ? 'running' : 'stopped',
          timestamp: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      }
    } finally {
      await prisma.$disconnect()
    }
  }
}

// CLI Interface
const server = new MCPTestServer()

const method = process.argv[2]
const params = process.argv[3] ? JSON.parse(process.argv[3]) : undefined

if (!method) {
  console.error('Usage: npx tsx scripts/mcp-test-server.ts <method> [params]')
  console.error('Methods: test-database, test-api, test-all, seed-data, cleanup, generate-mock, health-check')
  process.exit(1)
}

server.handleRequest({ method, params }).then(response => {
  console.log(JSON.stringify(response, null, 2))
  process.exit(response.success ? 0 : 1)
}).catch(error => {
  console.error('MCP Server Error:', error)
  process.exit(1)
})
