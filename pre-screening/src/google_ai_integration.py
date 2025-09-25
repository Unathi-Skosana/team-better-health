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
        
        # Initialize the model (using the updated model name)
        self.model = genai.GenerativeModel('gemini-1.5-flash')
        
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
                "model_used": "gemini-1.5-flash",
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
                "model_used": "gemini-1.5-flash"
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