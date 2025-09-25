import { PatientBookingForm } from "@/components/patient-booking-form"

export default function BookingPage() {
  return (
    <div className="p-4">
      {/* Header */}
      <header className="container mx-auto py-6">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">🏥</span>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Medical Practice</h1>
            <p className="text-sm text-gray-600">Professional Healthcare Services</p>
          </div>
        </div>
      </header>

      <div className="container mx-auto py-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Book Your Medical Appointment
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Schedule your appointment with our medical team. Fill out the form below 
            and we'll call you to confirm your visit details and conduct a brief 
            pre-visit screening.
          </p>
        </div>
        
        <div className="flex justify-center">
          <PatientBookingForm />
        </div>

        <div className="mt-12 max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📞</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Quick Call Back</h3>
              <p className="text-gray-600 text-sm">
                We'll call you within 15 minutes during business hours to schedule your appointment.
              </p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏥</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Pre-Visit Screening</h3>
              <p className="text-gray-600 text-sm">
                Our clinical assistant will gather preliminary information to prepare for your visit.
              </p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Efficient Process</h3>
              <p className="text-gray-600 text-sm">
                Streamlined booking and screening process to get you the care you need quickly.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="bg-white rounded-lg shadow-sm p-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold mb-4">What to Expect</h3>
            <div className="text-left space-y-3 text-sm text-gray-600">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-semibold text-blue-600 mt-0.5">1</span>
                <div>
                  <strong>Submit Form:</strong> Provide your name, phone number, and reason for visit
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-semibold text-blue-600 mt-0.5">2</span>
                <div>
                  <strong>Receive Call:</strong> Our clinical assistant will call you to confirm details
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-semibold text-blue-600 mt-0.5">3</span>
                <div>
                  <strong>Pre-Visit Screening:</strong> Brief interview to prepare for your appointment
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-semibold text-blue-600 mt-0.5">4</span>
                <div>
                  <strong>Schedule Appointment:</strong> Confirm your preferred date and time
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 py-8 border-t border-gray-200">
          <div className="text-center text-sm text-gray-600">
            <p className="mb-2">
              <strong>Medical Practice</strong> - Your trusted healthcare provider
            </p>
            <p className="text-xs">
              Professional medical services with compassionate care
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}
