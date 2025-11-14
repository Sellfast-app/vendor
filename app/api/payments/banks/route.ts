// app/api/payments/banks/route.ts
import { NextResponse } from 'next/server'

const API_BASE_URL = "https://api.swiftree.app";

export async function GET() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/payments/banks`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        {
          status: 'error',
          message: errorData.message || 'Failed to fetch banks'
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('Error fetching banks:', error)
    return NextResponse.json(
      {
        status: 'error',
        message: 'Internal server error while fetching banks'
      },
      { status: 500 }
    )
  }
}