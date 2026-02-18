// app/api/payments/resolve-account/route.ts
import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const account_number = searchParams.get('account_number')
    const bank_code = searchParams.get('bank_code')

    if (!account_number || !bank_code) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Account number and bank code are required'
        },
        { status: 400 }
      )
    }

    const response = await fetch(
      `${API_BASE_URL}/api/payments/resolve-account?account_number=${account_number}&bank_code=${bank_code}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        {
          status: 'error',
          message: errorData.message || 'Failed to resolve account'
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('Error resolving account:', error)
    return NextResponse.json(
      {
        status: 'error',
        message: 'Internal server error while resolving account'
      },
      { status: 500 }
    )
  }
}