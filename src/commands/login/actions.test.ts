import { afterAll, afterEach, beforeAll, expect } from 'vitest'

import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { loginWithEmailAndPassword, loginWithOtp, loginWithToken } from './actions'
import chalk from 'chalk'

const emailRegex = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/

const handlers = [
  http.get('https://api.storyblok.com/v1/users/me', async ({ request }) => {
    const token = request.headers.get('Authorization')
    if (token === 'valid-token') { return HttpResponse.json({ data: 'user data' }) }
    return new HttpResponse('Unauthorized', { status: 401 })
  }),
  http.post('https://api.storyblok.com/v1/users/login', async ({ request }) => {
    const body = await request.json() as { email: string, password: string }

    if (!emailRegex.test(body.email)) {
      return new HttpResponse('Unprocessable Entity', { status: 422 })
    }

    if (body?.email === 'julio.iglesias@storyblok.com' && body?.password === 'password') {
      return HttpResponse.json({ otp_required: true })
    }
    else {
      return new HttpResponse('Unauthorized', { status: 401 })
    }
  }),
]

const server = setupServer(...handlers)

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

//  Close server after all tests
afterAll(() => server.close())

// Reset handlers after each test `important for test isolation`
afterEach(() => server.resetHandlers())

describe('login actions', () => {
  describe('loginWithToken', () => {
    it('should login successfully with a valid token', async () => {
      const mockResponse = { data: 'user data' }
      const result = await loginWithToken('valid-token', 'eu')
      expect(result).toEqual(mockResponse)
    })

    it('should throw an masked error for invalid token', async () => {
      await expect(loginWithToken('invalid-token', 'eu')).rejects.toThrow(
        new Error(`The token provided ${chalk.bold('inva*********')} is invalid.
        Please make sure you are using the correct token and try again.`),
      )
    })

    it('should throw a network error if response is empty (network)', async () => {
      server.use(
        http.get('https://api.storyblok.com/v1/users/me', () => {
          return new HttpResponse(null, { status: 500 })
        }),
      )
      await expect(loginWithToken('any-token', 'eu')).rejects.toThrow(
        'No response from server, please check if you are correctly connected to internet',
      )
    })
  })

  describe('loginWithEmailAndPassword', () => {
    it('should get if the user requires otp', async () => {
      const expected = { otp_required: true }
      const result = await loginWithEmailAndPassword('julio.iglesias@storyblok.com', 'password', 'eu')
      expect(result).toEqual(expected)
    })

    it('should throw an error for invalid email', async () => {
      await expect(loginWithEmailAndPassword('invalid-email', 'password', 'eu')).rejects.toThrow(
        'The provided credentials are invalid',
      )
    })

    it('should throw an error for invalid credentials', async () => {
      await expect(loginWithEmailAndPassword('david.bisbal@storyblok.com', 'password', 'eu')).rejects.toThrow(
        'The user is not authorized to access the API',
      )
    })
  })

  describe('loginWithOtp', () => {
    it('should login successfully with valid email, password, and otp', async () => {
      server.use(
        http.post('https://api.storyblok.com/v1/users/login', async ({ request }) => {
          const body = await request.json() as { email: string, password: string, otp_attempt: string }
          if (body?.email === 'julio.iglesias@storyblok.com' && body?.password === 'password' && body?.otp_attempt === '123456') {
            return HttpResponse.json({ access_token: 'Awiwi' })
          }

          else {
            return new HttpResponse('Unauthorized', { status: 401 })
          }
        }),
      )
      const expected = { access_token: 'Awiwi' }

      const result = await loginWithOtp('julio.iglesias@storyblok.com', 'password', '123456', 'eu')

      expect(result).toEqual(expected)
    })
  })
})
