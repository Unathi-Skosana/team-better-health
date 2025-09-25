# Bland AI Integration Setup

This document explains how to set up the Bland AI integration for the patient booking system.

## Required Environment Variables

Add the following environment variable to your `.env.local` file:

```bash
BLAND_AI_API_KEY=your_bland_ai_api_key_here
```

## Getting Your Bland AI API Key

1. Visit [Bland AI](https://bland.ai)
2. Sign up for an account
3. Navigate to your dashboard
4. Generate an API key
5. Copy the API key and add it to your environment variables

## Features

The booking system includes:

- **Patient Booking Form**: Simple form requiring name, phone, and reason for visit
- **Automated Phone Calls**: Uses Bland AI to call patients for pre-visit screening
- **Clinical Assistant**: AI-powered assistant conducts preliminary interviews
- **Call Recording**: All calls are recorded for quality assurance
- **Webhook Support**: Real-time call status updates

## API Endpoints

### POST /api/booking

Handles patient booking form submissions and initiates Bland AI calls.

**Request Body:**
```json
{
  "name": "John Doe",
  "phone": "+27812345678",
  "reason": "Headache and dizziness for the past week"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Call initiated successfully",
  "callId": "call_123456789",
  "patient": {
    "name": "John Doe",
    "phone": "+27812345678",
    "reason": "Headache and dizziness for the past week"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Call Configuration

The system is configured with the following Bland AI settings:

- **Voice**: June (professional female voice)
- **Language**: English
- **Max Duration**: 12 minutes
- **Recording**: Enabled
- **Noise Cancellation**: Disabled
- **Interruption Threshold**: 100ms
- **Voicemail Action**: Hang up

## Clinical Assistant Prompt

The AI assistant is configured to:
1. Confirm patient identity
2. Conduct systematic clinical questioning
3. Gather comprehensive symptom information
4. Prepare data for physician review
5. Schedule follow-up appointments

## Testing

To test the booking system:

1. Start the development server: `npm run dev`
2. Navigate to `/booking`
3. Fill out the patient form
4. Submit to trigger a test call (ensure you have a valid Bland AI API key)

## Security Considerations

- API keys are stored as environment variables
- Patient data is handled securely
- Calls are recorded for compliance
- All communications are encrypted

## Troubleshooting

### Common Issues

1. **"Service configuration error"**: Check that `BLAND_AI_API_KEY` is set in your environment variables
2. **"Failed to initiate call"**: Verify your Bland AI API key is valid and has sufficient credits
3. **"Invalid phone number format"**: Ensure phone numbers include country code (e.g., +27 for South Africa)

### Debug Mode

Enable debug logging by setting `NODE_ENV=development` in your environment variables.
