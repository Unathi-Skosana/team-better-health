# 🤖 Google AI Studio & Generative AI Integration Guide

## 📋 Overview

This guide shows you how to integrate Google AI Studio and Generative AI into your medical AI prescreening system. This will add powerful LLM capabilities for better symptom analysis, medical report generation, and patient interaction.

---

## 🚀 Step-by-Step Integration

### Step 1: Get Google AI Studio API Key

1. **Go to Google AI Studio**
   - Visit: https://aistudio.google.com/
   - Sign in with your Google account

2. **Create API Key**
   - Click "Get API Key" or "Create API Key"
   - Select "Create API key in new project" or choose existing project
   - Copy the generated API key (starts with `AIza...`)

3. **Save API Key Securely**
   ```bash
   # In your Codespaces terminal:
   echo "GOOGLE_AI_API_KEY=your_api_key_here" >> .env
   ```

---

### Step 2: Install Required Dependencies

```bash
# Activate virtual environment
source .venv/bin/activate

# Install Google AI SDK
pip install google-generativeai

# Update requirements.txt
echo "google-generativeai>=0.3.0" >> requirements.txt
```

---

### Step 3: Create Google AI Integration Module

**Create `src/google_ai_integration.py`:**

```python
"""
Google AI Integration for Medical Prescreening System
Integrates Google Generative AI for enhanced medical analysis
"""

import os
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class GoogleAIIntegration:
    """
    Google AI integration for medical prescreening system.
    Provides enhanced symptom analysis and medical report generation.
    """
    
    def __init__(self, api_key: Optional[str] = None):
        """Initialize Google AI integration."""
        self.logger = logging.getLogger(__name__)
        
        # Get API key from parameter or environment
        self.api_key = api_key or os.getenv('GOOGLE_AI_API_KEY')
        
        if not self.api_key:
            raise ValueError("Google AI API key not provided. Set GOOGLE_AI_API_KEY environment variable.")
        
        # Configure the API
        genai.configure(api_key=self.api_key)
        
        # Initialize the model
        self.model = genai.GenerativeModel('gemini-pro')
        
        self.logger.info("Google AI integration initialized successfully")
    
    def analyze_symptoms_with_ai(self, symptoms: str, patient_context: Dict = None) -> Dict[str, Any]:
        """
        Analyze symptoms using Google AI for enhanced medical insights.
        
        Args:
            symptoms: Patient's reported symptoms
            patient_context: Optional patient information (age, gender, etc.)
        
        Returns:
            AI analysis results including insights, recommendations, and severity assessment
        """
        try:
            # Build context-aware prompt
            prompt = self._build_medical_analysis_prompt(symptoms, patient_context)
            
            # Generate response
            response = self.model.generate_content(prompt)
            
            # Parse and structure the response
            analysis = self._parse_ai_response(response.text)
            
            return {
                "ai_analysis": analysis,
                "symptoms_processed": symptoms,
                "model_used": "gemini-pro",
                "timestamp": datetime.now().isoformat(),
                "success": True
            }
            
        except Exception as e:
            self.logger.error(f"Google AI analysis failed: {str(e)}")
            return {
                "error": str(e),
                "success": False,
                "timestamp": datetime.now().isoformat()
            }
    
    def enhance_medical_report(self, basic_report: Dict, symptoms: str) -> Dict[str, Any]:
        """
        Enhance existing medical report with AI-generated insights.
        
        Args:
            basic_report: Existing ICD-10 based report
            symptoms: Original symptoms text
        
        Returns:
            Enhanced report with AI insights
        """
        try:
            prompt = self._build_report_enhancement_prompt(basic_report, symptoms)
            
            response = self.model.generate_content(prompt)
            
            enhanced_content = {
                "ai_insights": response.text,
                "enhancement_timestamp": datetime.now().isoformat(),
                "model_used": "gemini-pro"
            }
            
            return {
                **basic_report,
                "ai_enhancement": enhanced_content,
                "enhanced": True
            }
            
        except Exception as e:
            self.logger.error(f"Report enhancement failed: {str(e)}")
            return {
                **basic_report,
                "ai_enhancement": {"error": str(e)},
                "enhanced": False
            }
    
    def generate_patient_questions(self, symptoms: str) -> List[str]:
        """
        Generate follow-up questions to gather more information.
        
        Args:
            symptoms: Initial symptoms reported
        
        Returns:
            List of relevant follow-up questions
        """
        try:
            prompt = f"""
            Based on these symptoms: "{symptoms}"
            
            Generate 3-5 relevant follow-up questions that a healthcare provider would ask to better understand the patient's condition. Focus on:
            - Duration and onset
            - Associated symptoms
            - Severity and impact
            - Relevant medical history
            
            Return only the questions, numbered 1-5.
            """
            
            response = self.model.generate_content(prompt)
            
            # Parse questions from response
            questions = []
            for line in response.text.split('\n'):
                line = line.strip()
                if line and (line[0].isdigit() or line.startswith('•') or line.startswith('-')):
                    # Clean up the question
                    question = line.lstrip('0123456789.•- ').strip()
                    if question:
                        questions.append(question)
            
            return questions[:5]  # Limit to 5 questions
            
        except Exception as e:
            self.logger.error(f"Question generation failed: {str(e)}")
            return [
                "How long have you been experiencing these symptoms?",
                "Are there any other symptoms you've noticed?",
                "On a scale of 1-10, how would you rate the severity?"
            ]
    
    def _build_medical_analysis_prompt(self, symptoms: str, patient_context: Dict = None) -> str:
        """Build context-aware prompt for medical analysis."""
        base_prompt = f"""
        You are a medical AI assistant helping with initial symptom analysis. 

        IMPORTANT DISCLAIMERS:
        - This is for prescreening purposes only
        - Not a substitute for professional medical diagnosis
        - Encourage patients to seek proper medical care

        Patient Symptoms: "{symptoms}"
        """
        
        if patient_context:
            base_prompt += f"\nPatient Context: {patient_context}"
        
        base_prompt += """
        
        Please provide a structured analysis including:
        
        1. SYMPTOM SUMMARY:
           - Brief overview of reported symptoms
        
        2. POSSIBLE CONDITIONS:
           - 2-3 most likely conditions based on symptoms
           - Include confidence level (Low/Medium/High)
        
        3. SEVERITY ASSESSMENT:
           - Urgency level (Routine/Urgent/Emergency)
           - Reasoning for assessment
        
        4. RECOMMENDATIONS:
           - Immediate actions patient should take
           - When to seek medical attention
        
        5. RED FLAGS:
           - Warning signs that require immediate medical attention
        
        Keep responses professional, clear, and emphasize the importance of consulting healthcare providers.
        """
        
        return base_prompt
    
    def _build_report_enhancement_prompt(self, basic_report: Dict, symptoms: str) -> str:
        """Build prompt for enhancing existing medical report."""
        icd10_codes = basic_report.get('icd10_results', [])
        
        prompt = f"""
        Enhance this medical prescreening report with additional clinical insights:
        
        Original Symptoms: "{symptoms}"
        
        ICD-10 Analysis Found:
        """
        
        for result in icd10_codes[:3]:
            prompt += f"- {result.get('code', 'N/A')}: {result.get('description', 'N/A')} (Confidence: {result.get('confidence', 0)*100:.0f}%)\n"
        
        prompt += """
        
        Please provide:
        
        1. CLINICAL CORRELATION:
           - How well do the ICD-10 codes match the symptoms?
           - Any additional considerations?
        
        2. DIFFERENTIAL DIAGNOSIS:
           - Alternative conditions to consider
           - What additional information would help differentiate?
        
        3. CARE PATHWAY:
           - Recommended next steps for evaluation
           - Timeline for follow-up
        
        4. PATIENT EDUCATION:
           - Key points to explain to the patient
           - Warning signs to watch for
        
        Keep insights professional and emphasize this is preliminary analysis requiring medical validation.
        """
        
        return prompt
    
    def _parse_ai_response(self, response_text: str) -> Dict[str, str]:
        """Parse AI response into structured format."""
        sections = {}
        current_section = "general"
        current_content = []
        
        for line in response_text.split('\n'):
            line = line.strip()
            if not line:
                continue
            
            # Check if this is a section header
            if any(keyword in line.upper() for keyword in ['SYMPTOM SUMMARY', 'POSSIBLE CONDITIONS', 'SEVERITY', 'RECOMMENDATIONS', 'RED FLAGS']):
                # Save previous section
                if current_content:
                    sections[current_section] = '\n'.join(current_content)
                
                # Start new section
                current_section = line.lower().replace(':', '').strip()
                current_content = []
            else:
                current_content.append(line)
        
        # Save final section
        if current_content:
            sections[current_section] = '\n'.join(current_content)
        
        return sections

def test_google_ai_integration():
    """Test function for Google AI integration."""
    try:
        ai = GoogleAIIntegration()
        
        # Test symptom analysis
        test_symptoms = "I have severe headache with nausea and dizziness for 2 days"
        result = ai.analyze_symptoms_with_ai(test_symptoms)
        
        print("✅ Google AI Integration Test Successful!")
        print(f"Analysis: {result}")
        
        return True
        
    except Exception as e:
        print(f"❌ Google AI Integration Test Failed: {str(e)}")
        return False

if __name__ == "__main__":
    test_google_ai_integration()
```

---

### Step 4: Update Flask App with Google AI

**Add to `app.py` (after the existing imports):**

```python
# Add this import at the top with other imports
from src.google_ai_integration import GoogleAIIntegration
```

**Add new endpoint in `app.py`:**

```python
@app.route(f"{API_BASE}/ai-analyze", methods=["POST"])
def ai_analyze_symptoms():
    """
    Enhanced symptom analysis using Google AI.
    Provides more detailed insights beyond basic ICD-10 mapping.
    """
    try:
        data = request.get_json()
        
        if not data or 'symptoms' not in data:
            return jsonify(create_error_response("No symptoms provided", 400))
        
        symptoms = data.get('symptoms', '').strip()
        patient_context = data.get('patient_context', {})
        
        if not symptoms:
            return jsonify(create_error_response("Empty symptoms text", 400))
        
        app.logger.info(f"🤖 AI Analysis Request: {symptoms}")
        
        # Initialize Google AI
        google_ai = GoogleAIIntegration()
        
        # Get basic ICD-10 analysis
        from src.icd10_mapper import ICD10Mapper
        icd10_mapper = ICD10Mapper()
        icd10_results = icd10_mapper.map_symptoms_to_icd10(symptoms)
        
        # Get AI enhancement
        ai_analysis = google_ai.analyze_symptoms_with_ai(symptoms, patient_context)
        
        # Generate follow-up questions
        follow_up_questions = google_ai.generate_patient_questions(symptoms)
        
        # Create comprehensive response
        response_data = {
            'symptoms': symptoms,
            'icd10_analysis': {
                'codes': icd10_results,
                'count': len(icd10_results)
            },
            'ai_analysis': ai_analysis,
            'follow_up_questions': follow_up_questions,
            'processed_at': datetime.now().isoformat(),
            'source': 'google_ai_enhanced'
        }
        
        return jsonify(create_success_response(response_data, "AI analysis complete"))
        
    except Exception as e:
        app.logger.error(f"AI analysis error: {str(e)}")
        return jsonify(create_error_response(f"AI analysis failed: {str(e)}", 500))
```

---

### Step 5: Enhance Voice Interface with Google AI

**Update `static/voice.js` - Add this method to the VoiceMedicalAssistant class:**

```javascript
async processWithGoogleAI(transcript) {
    this.showTranscript(transcript);
    this.updateStatus('🤖 Analyzing with Google AI...', 'processing');
    
    try {
        // Send to enhanced AI endpoint
        const response = await fetch('/api/v1/ai-analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                symptoms: transcript,
                patient_context: {
                    input_method: 'voice',
                    timestamp: new Date().toISOString()
                }
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            this.showICD10Results(data.data.icd10_analysis.codes);
            this.showAIInsights(data.data.ai_analysis);
            this.showFollowUpQuestions(data.data.follow_up_questions);
            this.updateStatus(`✅ AI Analysis complete - Found ${data.data.icd10_analysis.count} codes`, 'complete');
        } else {
            this.showError(`AI Analysis failed: ${data.message}`);
        }
        
    } catch (error) {
        this.showError(`Network error: ${error.message}`);
    }
}

showAIInsights(aiAnalysis) {
    if (!aiAnalysis.success) {
        return;
    }
    
    const analysis = aiAnalysis.ai_analysis;
    let html = '<div class="ai-insights">';
    
    for (const [section, content] of Object.entries(analysis)) {
        html += `
            <div class="ai-section">
                <h4>${section.replace(/_/g, ' ').toUpperCase()}</h4>
                <div class="ai-content">${content}</div>
            </div>
        `;
    }
    
    html += '</div>';
    
    // Add AI insights section to the page
    let aiSection = document.getElementById('ai-insights-section');
    if (!aiSection) {
        aiSection = document.createElement('section');
        aiSection.id = 'ai-insights-section';
        aiSection.className = 'result-section';
        aiSection.innerHTML = '<h3>🤖 AI Medical Insights:</h3><div id="ai-insights"></div>';
        document.getElementById('results-section').after(aiSection);
    }
    
    document.getElementById('ai-insights').innerHTML = html;
    aiSection.style.display = 'block';
}

showFollowUpQuestions(questions) {
    if (!questions || questions.length === 0) return;
    
    let html = '<div class="follow-up-questions">';
    html += '<h4>Recommended Follow-up Questions:</h4><ul>';
    
    questions.forEach(question => {
        html += `<li>${question}</li>`;
    });
    
    html += '</ul></div>';
    
    // Add questions section
    let questionsSection = document.getElementById('questions-section');
    if (!questionsSection) {
        questionsSection = document.createElement('section');
        questionsSection.id = 'questions-section';
        questionsSection.className = 'result-section';
        questionsSection.innerHTML = '<h3>❓ Follow-up Questions:</h3><div id="follow-up-questions"></div>';
        document.getElementById('ai-insights-section').after(questionsSection);
    }
    
    document.getElementById('follow-up-questions').innerHTML = html;
    questionsSection.style.display = 'block';
}
```

---

### Step 6: Add Google AI Button to Voice Interface

**Update `static/voice.html` - Add this button after the existing voice controls:**

```html
<!-- Add this after the existing voice buttons -->
<button id="aiAnalyzeBtn" class="voice-btn ai-analyze">
    🤖 Analyze with Google AI
</button>
```

**Update `static/voice.js` - Add AI button event listener:**

```javascript
// Add this in the bindEvents() method
this.aiAnalyzeBtn = document.getElementById('aiAnalyzeBtn');
this.aiAnalyzeBtn.addEventListener('click', () => this.analyzeWithAI());

// Add this new method
analyzeWithAI() {
    const lastTranscript = this.transcript.textContent;
    if (lastTranscript && lastTranscript !== '""') {
        const cleanTranscript = lastTranscript.replace(/^"|"$/g, '');
        this.processWithGoogleAI(cleanTranscript);
    } else {
        this.showError('No transcript available. Please record your symptoms first.');
    }
}
```

---

### Step 7: Add CSS Styles for AI Features

**Add to `static/voice.css`:**

```css
.voice-btn.ai-analyze {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.voice-btn.ai-analyze:hover:not(:disabled) {
    background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
    transform: translateY(-2px);
}

.ai-insights {
    margin-top: 20px;
}

.ai-section {
    margin-bottom: 15px;
    padding: 15px;
    background: #f8f9fa;
    border-radius: 8px;
    border-left: 4px solid #667eea;
}

.ai-section h4 {
    color: #2c3e50;
    margin-bottom: 10px;
    font-size: 1rem;
    text-transform: capitalize;
}

.ai-content {
    color: #555;
    line-height: 1.6;
}

.follow-up-questions {
    background: #fff3e0;
    padding: 15px;
    border-radius: 8px;
    border-left: 4px solid #ff9800;
}

.follow-up-questions h4 {
    color: #e65100;
    margin-bottom: 10px;
}

.follow-up-questions ul {
    margin-left: 20px;
}

.follow-up-questions li {
    margin-bottom: 5px;
    color: #555;
}
```

---

### Step 8: Test the Integration

```bash
# 1. Test the Google AI module
cd /workspaces/codespaces-blank
source .venv/bin/activate
python src/google_ai_integration.py

# 2. Test the API endpoint
curl -X POST http://127.0.0.1:9000/api/v1/ai-analyze \
  -H "Content-Type: application/json" \
  -d '{"symptoms": "severe headache with nausea", "patient_context": {"age": 30}}'

# 3. Start the Flask server
HOST=0.0.0.0 PORT=9000 python app.py
```

---

## 🎯 New Capabilities Added

### Enhanced Voice Interface:
- **🎙️ Voice Input** → **🤖 Google AI Analysis** → **📋 Comprehensive Report**
- Real-time AI insights
- Follow-up question suggestions
- Enhanced medical reasoning

### New API Endpoints:
- `POST /api/v1/ai-analyze` - Google AI enhanced analysis
- Enhanced `/api/v1/voice-analyze` with AI integration

### Features:
✅ **Advanced symptom analysis** using Gemini Pro  
✅ **Follow-up question generation** for better diagnosis  
✅ **Clinical correlation** between ICD-10 codes and symptoms  
✅ **Severity assessment** with urgency levels  
✅ **Care pathway recommendations**  
✅ **Professional medical disclaimers**  

---

## 🚀 Demo Flow with Google AI

1. **Voice Input**: "I have severe chest pain and shortness of breath"
2. **Basic ICD-10**: Shows relevant medical codes
3. **Click "🤖 Analyze with Google AI"**
4. **AI Insights**: Detailed clinical analysis, severity assessment
5. **Follow-up Questions**: "How long have you had these symptoms?"
6. **Enhanced Report**: Complete medical prescreening with AI insights

---

**Your medical AI system now has Google AI superpowers! 🚀🤖**

Need help with any step? Let me know!