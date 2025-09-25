"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Phone, User, MessageSquare, CheckCircle, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface BookingFormData {
  name: string
  phone: string
  reason: string
}

interface BookingFormProps {
  onBookingSuccess?: (data: BookingFormData) => void
}

export function PatientBookingForm({ onBookingSuccess }: BookingFormProps) {
  const [formData, setFormData] = useState<BookingFormData>({
    name: "",
    phone: "",
    reason: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const { toast } = useToast()

  const handleInputChange = (field: keyof BookingFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error state when user starts typing
    if (submitStatus === "error") {
      setSubmitStatus("idle")
      setErrorMessage("")
    }
  }

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setErrorMessage("Please enter your full name")
      setSubmitStatus("error")
      return false
    }
    if (!formData.phone.trim()) {
      setErrorMessage("Please enter your phone number")
      setSubmitStatus("error")
      return false
    }
    if (!formData.reason.trim()) {
      setErrorMessage("Please describe the reason for your visit")
      setSubmitStatus("error")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)
    setSubmitStatus("idle")

    try {
      const response = await fetch("/api/booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to process booking request")
      }

      setSubmitStatus("success")
      toast({
        title: "Booking Request Submitted",
        description: "We'll call you shortly to confirm your appointment details.",
      })

      // Reset form after successful submission
      setFormData({ name: "", phone: "", reason: "" })
      
      // Call success callback if provided
      onBookingSuccess?.(formData)

    } catch (error) {
      console.error("Booking submission error:", error)
      setSubmitStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "Failed to submit booking request")
      toast({
        title: "Booking Failed",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Phone className="w-6 h-6 text-primary" />
        </div>
        <CardTitle className="text-2xl">Book Your Appointment</CardTitle>
        <CardDescription>
          Fill out this form and we'll call you to schedule your visit
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Full Name
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              disabled={isSubmitting}
              className={submitStatus === "error" && !formData.name.trim() ? "border-destructive" : ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Phone Number
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+27 XX XXX XXXX"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              disabled={isSubmitting}
              className={submitStatus === "error" && !formData.phone.trim() ? "border-destructive" : ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Reason for Visit
            </Label>
            <Textarea
              id="reason"
              placeholder="Please describe your symptoms or reason for the appointment..."
              value={formData.reason}
              onChange={(e) => handleInputChange("reason", e.target.value)}
              disabled={isSubmitting}
              rows={4}
              className={submitStatus === "error" && !formData.reason.trim() ? "border-destructive" : ""}
            />
          </div>

          {submitStatus === "error" && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {submitStatus === "success" && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Your booking request has been submitted successfully! We'll call you shortly.
              </AlertDescription>
            </Alert>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Phone className="w-4 h-4 mr-2" />
                Request Call Back
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>
            By submitting this form, you agree to receive a call from our medical staff 
            to schedule your appointment.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
