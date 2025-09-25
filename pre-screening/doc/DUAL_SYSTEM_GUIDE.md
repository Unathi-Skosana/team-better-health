# 🎯 Dual System Operation Guide
## Running Voice Interface + CLI Chatbot Simultaneously

**Created:** September 25, 2025  
**For:** Hackathon Demo & Development  
**Systems:** Voice Web Interface + Rich CLI Chatbot  

---

## 🚀 Quick Start (Option 1 - Recommended)

### Terminal 1: Flask Server (Voice + API)
```bash
cd /workspaces/codespaces-blank
source .venv/bin/activate
HOST=0.0.0.0 PORT=9000 python app.py
```

### Terminal 2: CLI Chatbot
```bash
cd /workspaces/codespaces-blank  
source .venv/bin/activate
python demo.py
```

---

## 🌐 System Access Points

### Voice Interface (Web-Based)
- **URL:** `https://your-codespace-9000.github.dev/voice`
- **Port:** 9000
- **Method:** Browser access
- **Features:**
  - 🎙️ Real-time speech recognition
  - 📊 ICD-10 medical coding
  - 📄 **Full medical report generation** (NEW!)
  - 🎯 Sample symptom buttons for demos
  - 📱 Mobile responsive design

### CLI Chatbot (Terminal-Based)  
- **Location:** Terminal 2
- **Command:** `python demo.py`
- **Features:**
  - 💬 Interactive medical chat
  - 🎨 Rich terminal formatting
  - 📊 ICD-10 medical coding
  - 📄 Full medical report generation
  - 💾 Report storage system

### REST API Endpoints
- **Base URL:** `https://your-codespace-9000.github.dev/api/v1`
- **Port:** 9000 (same as voice interface)
- **Key Endpoints:**
  - `POST /api/v1/voice-analyze` - Voice symptom analysis
  - `GET /api/v1/reports` - List all medical reports
  - `POST /api/v1/reports` - Create new report
  - `GET /api/v1/health` - System health check

---

## 📊 Feature Comparison

| Feature | Voice Interface | CLI Chatbot | REST API |
|---------|----------------|-------------|----------|
| **Input Method** | 🎙️ Speech + Click | ⌨️ Text typing | 📡 HTTP requests |
| **ICD-10 Coding** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Medical Reports** | ✅ Yes (NEW!) | ✅ Yes | ✅ Yes |
| **Report Storage** | ✅ Auto-saved | ✅ Auto-saved | ✅ Manual save |
| **Accessibility** | 🌟 Voice + Visual | 👨‍💻 Developer friendly | 🔧 Integration ready |
| **Demo Impact** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |

---

## 🎭 Hackathon Demo Strategy

### 60-Second Power Demo Flow

**Phase 1: Voice Interface (30 seconds)**
1. **Open:** `https://your-codespace-9000.github.dev/voice`
2. **Quick Demo:** Click "Headache + Nausea" button
3. **Live Voice:** Say "I have chest pain and shortness of breath"
4. **Show Results:** Real-time transcription → ICD-10 codes → Medical report

**Phase 2: CLI Chatbot (20 seconds)**
1. **Switch to Terminal 2** 
2. **Type:** "I've been having severe stomach pain for 3 days"
3. **Show:** Rich terminal output with medical analysis

**Phase 3: Integration (10 seconds)**
1. **Show:** Both systems use same API endpoints
2. **Highlight:** "Zero installation, works anywhere!"

---

## 🔧 Technical Implementation Details

### Voice Interface Enhanced Features (NEW!)
```javascript
// Now includes full medical report generation
async processTranscript(transcript) {
    const response = await fetch('/api/v1/voice-analyze', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({symptoms: transcript})
    });
    
    const data = await response.json();
    
    if (data.success) {
        // Display ICD-10 codes
        this.showICD10Results(data.data.icd10_results);
        
        // NEW: Display medical report
        this.showMedicalReport(data.data.medical_report);
    }
}
```

### Flask Server Capabilities
```python
@app.route('/api/v1/voice-analyze', methods=['POST'])
def voice_analyze():
    # Enhanced with medical report generation
    icd10_results = icd10_mapper.map_symptoms_to_icd10(symptoms)
    medical_report = report_generator.generate_report(patient_data, icd10_results)
    
    response_data = {
        'transcript': symptoms,
        'icd10_results': icd10_results,
        'medical_report': medical_report,  # NEW!
        'analysis_count': len(icd10_results),
        'source': 'voice_input'
    }
```

---

## 🐛 Troubleshooting

### Port Issues
```bash
# If port 9000 is busy, try 9001
HOST=0.0.0.0 PORT=9001 python app.py

# Kill existing processes
pkill -f "python app.py"
```

### Voice Not Working
1. **Check browser:** Chrome/Edge work best
2. **Allow microphone access** when prompted
3. **Try sample buttons first** for quick demo
4. **Use HTTPS** in production (Codespaces handles this)

### CLI Chatbot Issues
```bash
# Make sure virtual environment is active
source .venv/bin/activate

# Check if demo.py exists
ls -la demo.py

# Run with verbose output
python -v demo.py
```

---

## 🌟 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    GitHub Codespaces Environment                │
├─────────────────────────────────────────────────────────────────┤
│  Terminal 1: Flask Server (Port 9000)                          │
│  ┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐ │
│  │   Voice Web UI  │    │  Flask API   │    │ Medical Report  │ │
│  │   /voice        ├────┤ /api/v1/*    ├────┤   Generator     │ │
│  │  (Browser)      │    │              │    │                 │ │
│  └─────────────────┘    └──────────────┘    └─────────────────┘ │
│                                │                                │
│  Terminal 2: CLI Chatbot       │                                │
│  ┌─────────────────┐          │        ┌─────────────────┐     │
│  │   demo.py       │          │        │   ICD-10        │     │
│  │  (Rich CLI)     ├──────────┼────────┤   Mapper        │     │
│  │                 │          │        │                 │     │
│  └─────────────────┘          │        └─────────────────┘     │
│                                │                                │
│                        ┌──────────────┐                        │
│                        │ Report       │                        │
│                        │ Storage      │                        │
│                        │ (JSON Files) │                        │
│                        └──────────────┘                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📈 Performance & Scalability

### Current Setup
- **Voice Interface:** Real-time processing, <2 second response
- **CLI Chatbot:** Instant local processing
- **Storage:** JSON file system (perfect for hackathons)
- **Concurrency:** Multiple users can access voice interface

### Production Considerations
- **Database:** Upgrade from JSON to PostgreSQL
- **Authentication:** Add user management
- **HTTPS:** Already handled by Codespaces
- **Caching:** Add Redis for faster responses

---

## 🎯 Demo Scripts

### Voice Interface Script
```
"Let me demonstrate our voice-enabled medical assistant"
→ Open /voice URL
→ "First, a quick sample" → Click "Chest Pain" button
→ "Now with real voice input" → Click record, speak symptoms  
→ "Notice: Real-time transcription, instant medical coding, and full report generation"
→ "All running in the browser with zero installation!"
```

### CLI Chatbot Script  
```
"Our system also provides a professional CLI interface"
→ Switch to Terminal 2
→ Type medical symptoms
→ "Same medical intelligence, developer-friendly interface"
→ "Perfect for healthcare integrations"
```

### Integration Script
```
"Both interfaces use the same medical AI backend"
→ Show API endpoints list
→ "RESTful API ready for any healthcare system"
→ "Deploy anywhere: cloud, on-premise, or edge devices"
```

---

## 🔗 Quick Links

- **Voice Interface:** `/voice` (Browser)
- **API Documentation:** `docs/REST_API_DOCUMENTATION.md`
- **CLI Demo:** `python demo.py` (Terminal)
- **Health Check:** `/api/v1/health`
- **View Reports:** `python view_reports.py`

---

## 🏆 Success Metrics

**For Hackathon Judges:**
- ✅ **Zero setup time** - Works immediately
- ✅ **Real medical value** - Actual ICD-10 coding
- ✅ **Accessibility** - Voice input for all users
- ✅ **Professional grade** - Healthcare provider ready
- ✅ **Technical excellence** - Modern web technologies
- ✅ **Scalability** - API-first architecture

**System Status:**
- ✅ Voice interface fully functional
- ✅ CLI chatbot fully functional  
- ✅ Medical report generation working
- ✅ ICD-10 coding operational
- ✅ Report storage system active
- ✅ REST API endpoints verified

---

*Dual System Guide - Voice + CLI Medical AI Assistant Ready for Demo!* 🎉