import { NextRequest, NextResponse } from "next/server"

interface BookingRequest {
  name: string
  phone: string
  reason: string
}

export async function POST(request: NextRequest) {
  try {
    const body: BookingRequest = await request.json()
    
    // Validate required fields
    if (!body.name || !body.phone || !body.reason) {
      return NextResponse.json(
        { error: "Missing required fields: name, phone, and reason are required" },
        { status: 400 }
      )
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
    if (!phoneRegex.test(body.phone.replace(/\s/g, ""))) {
      return NextResponse.json(
        { error: "Invalid phone number format" },
        { status: 400 }
      )
    }

    // Get Bland AI API key from environment variables
    const blandApiKey = process.env.BLAND_AI_API_KEY
    if (!blandApiKey) {
      console.error("BLAND_AI_API_KEY environment variable is not set")
      return NextResponse.json(
        { error: "Service configuration error. Please try again later." },
        { status: 500 }
      )
    }

    // Format phone number for international use (assuming South African numbers)
    let formattedPhone = body.phone.replace(/\s/g, "")
    if (!formattedPhone.startsWith("+")) {
      if (formattedPhone.startsWith("0")) {
        // Replace leading 0 with +27
        formattedPhone = "+27" + formattedPhone.substring(1)
      } else if (formattedPhone.startsWith("27")) {
        formattedPhone = "+" + formattedPhone
      } else {
        formattedPhone = "+27" + formattedPhone
      }
    }

    // Create the clinical assistant prompt with patient context
    const clinicalPrompt = `You're Sarah, a clinical assistant working with a primary care physician. You're conducting a patient interview to gather comprehensive information through systematic questioning to assist the doctor in their assessment. Use clinical reasoning to guide your questions, aiming to explore symptoms thoroughly and probe for critical clinical clues. Ask one question at a time, keeping them concise and focused. Your goal is to be thorough in your inquiry, gathering complete information for the physician's evaluation and report.

IMPORTANT PATIENT CONTEXT:
- Patient Name: ${body.name}
- Reason for Visit: ${body.reason}
- This is a pre-visit screening call to prepare for their upcoming appointment

Start by confirming the patient's identity and then proceed with clinical questioning based on their stated reason for the visit. Be professional, empathetic, and thorough in your inquiry.

Here's an example dialogue:
Patient: Hello?
You: Hi, this is Sarah, the clinical assistant from Dr. Smith's office. I'm calling to conduct a brief interview before your upcoming appointment. Could you confirm your full name for me?
Patient: Hi Sarah, yes this is ${body.name}.
You: Thank you ${body.name}. I understand you're coming in regarding ${body.reason}. I'd like to ask you some questions about this to help Dr. Smith prepare for your visit. Can you tell me more about what you're experiencing?`

    // Prepare Bland AI API request
    const blandApiRequest = {
      phone_number: formattedPhone,
      voice: "June",
      wait_for_greeting: false,
      record: true,
      answered_by_enabled: true,
      noise_cancellation: false,
      interruption_threshold: 100,
      block_interruptions: false,
      max_duration: 12,
      model: "base",
      language: "en",
      background_track: "none",
      endpoint: "https://api.bland.ai",
      voicemail_action: "hangup",
      task: clinicalPrompt,
      webhook_events: ["call", "webhook", "error"],
      metadata: {
        patient_name: body.name,
        reason_for_visit: body.reason,
        booking_source: "patient_form",
        timestamp: new Date().toISOString()
      }
    }

    // Make request to Bland AI API
    const blandResponse = await fetch("https://api.bland.ai/v1/calls", {
      method: "POST",
      headers: {
        "Authorization": blandApiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(blandApiRequest),
    })

    if (!blandResponse.ok) {
      const errorData = await blandResponse.text()
      console.error("Bland AI API error:", errorData)
      return NextResponse.json(
        { error: "Failed to initiate call. Please try again later." },
        { status: 500 }
      )
    }

    const blandResult = await blandResponse.json()
    console.log("Bland AI call initiated:", blandResult)

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Call initiated successfully",
      callId: blandResult.call_id,
      patient: {
        name: body.name,
        phone: formattedPhone,
        reason: body.reason
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error("Booking API error:", error)
    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    )
  }
}
