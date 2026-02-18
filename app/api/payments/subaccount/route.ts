// app/api/payments/subaccount/route.ts
import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('🔧 Creating business subaccount with:', body)
    
    const {
      store_id,
      business_name,
      settlement_bank,
      account_number
    } = body

    // Validate required fields
    if (!store_id || !business_name || !settlement_bank || !account_number) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Missing required fields: store_id, business_name, settlement_bank, account_number'
        },
        { status: 400 }
      )
    }

    // Get auth token from request cookies (from your login endpoint)
    const authToken = request.cookies.get('accessToken')?.value;

    if (!authToken) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Authentication required. Please login again.'
        },
        { status: 401 }
      )
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    }

    console.log('🚀 Sending to Swiftree API:', {
      store_id,
      business_name,
      settlement_bank,
      account_number
    })

    const response = await fetch(
      `${API_BASE_URL}/api/payments/subaccount`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          store_id,
          business_name,
          settlement_bank,
          account_number
        })
      }
    )

    console.log('📨 Swiftree API response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Swiftree subaccount creation error:', errorText)
      
      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { message: errorText }
      }
      
      return NextResponse.json(
        {
          status: 'error',
          message: errorData.message || `Failed to create business subaccount: ${response.status}`
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ Business subaccount created successfully:', data)
    
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('💥 Error creating business subaccount:', error)
    return NextResponse.json(
      {
        status: 'error',
        message: 'Internal server error while creating business subaccount'
      },
      { status: 500 }
    )
  }
}