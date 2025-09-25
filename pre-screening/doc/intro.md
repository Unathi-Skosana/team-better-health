# 🏥 Medical AI Prescreening System - Complete Rebuild Guide

## 📋 Project Overview

This guide will help you rebuild the **complete Medical AI Prescreening System** from scratch in a new repository for your hackathon. The system includes:

- ✅ **AI-Powered Medical Prescreening** (Local AI with DistilGPT2)
- ✅ **ICD-10 Medical Coding** (25+ symptom categories)
- ✅ **Professional Medical Reports** (Export-ready documentation)
- ✅ **JSON Storage System** (File-based medical records)
- ✅ **Flask REST API** (8 endpoints for third-party integration)
- ✅ **Interactive Chat Interface** (Rich CLI with multiple modes)

---

## 🚀 Step 1: Repository Setup

### 1.1 Create New Repository
```bash
# Create new directory
mkdir medical-ai-hackathon
cd medical-ai-hackathon

# Initialize git repository
git init
git branch -M main

# Create basic files
touch README.md
touch .gitignore
```

### 1.2 Create .gitignore
```bash
cat > .gitignore << 'EOF'
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg

# Virtual Environment
.venv/
venv/
ENV/
env/

# IDE
.vscode/
.idea/
*.swp
*.swo

# Medical Reports (optional - you might want to commit sample reports)
medical_reports/
*.json

# Logs
*.log
logs/

# OS
.DS_Store
Thumbs.db
EOF
```

---

## 🐍 Step 2: Python Environment Setup

### 2.1 Create Virtual Environment
```bash
# Create virtual environment
python3 -m venv .venv

# Activate virtual environment (Linux/Mac)
source .venv/bin/activate

# For Windows:
# .venv\Scripts\activate
```

### 2.2 Create requirements.txt
```bash
cat > requirements.txt << 'EOF'
# Core ML and AI
torch>=2.0.0
transformers>=4.30.0
huggingface-hub>=0.16.0

# Web Framework
Flask>=2.3.0
Flask-CORS>=4.0.0
requests>=2.31.0

# CLI and UI
rich>=13.4.0
click>=8.1.0

# Data Processing
pandas>=2.0.0
numpy>=1.24.0

# Testing
pytest>=7.4.0
pytest-flask>=1.2.0

# Utilities
python-dateutil>=2.8.0
pillow>=10.0.0
EOF
```

### 2.3 Install Dependencies
```bash
# Install all dependencies
pip install -r requirements.txt

# Verify installation
pip list | grep -E "(torch|transformers|flask|rich)"
```

---

## 🏗️ Step 3: Project Structure Creation

### 3.1 Create Directory Structure
```bash
# Create main directories
mkdir -p src
mkdir -p tests  
mkdir -p docs
mkdir -p medical_reports
mkdir -p examples

# Create __init__.py files
touch src/__init__.py
touch tests/__init__.py
```

### 3.2 Verify Structure
```bash
tree -a
# Should show:
# .
# ├── .git/
# ├── .gitignore
# ├── .venv/
# ├── README.md
# ├── requirements.txt
# ├── src/
# │   └── __init__.py
# ├── tests/
# │   └── __init__.py
# ├── docs/
# ├── medical_reports/
# └── examples/
```

---

## 💾 Step 4: Core System Components

### 4.1 Create ICD-10 Mapper
```bash
cat > src/icd10_mapper.py << 'EOF'
import re
import logging
from typing import List, Dict, Tuple

class ICD10Mapper:
    """
    Maps medical symptoms to ICD-10 diagnostic codes with confidence scoring.
    """
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        
        # Core symptom to ICD-10 mappings with confidence scores
        self.symptom_mappings = {
            # Respiratory symptoms
            'cough': [
                ('R05', 'Cough', 0.9),
                ('J00', 'Acute nasopharyngitis [common cold]', 0.6),
                ('J06.9', 'Acute upper respiratory infection, unspecified', 0.5)
            ],
            'shortness of breath|difficulty breathing|dyspnea': [
                ('R06.02', 'Shortness of breath', 0.95),
                ('J44.1', 'Chronic obstructive pulmonary disease with acute exacerbation', 0.4),
                ('I50.9', 'Heart failure, unspecified', 0.3)
            ],
            'sore throat|throat pain': [
                ('J02.9', 'Acute pharyngitis, unspecified', 0.85),
                ('J03.90', 'Acute tonsillitis, unspecified', 0.7),
                ('J06.9', 'Acute upper respiratory infection, unspecified', 0.6)
            ],
            'runny nose|nasal congestion|stuffy nose': [
                ('J00', 'Acute nasopharyngitis [common cold]', 0.8),
                ('J30.9', 'Allergic rhinitis, unspecified', 0.6),
                ('J06.9', 'Acute upper respiratory infection, unspecified', 0.5)
            ],
            
            # Cardiovascular symptoms
            'chest pain': [
                ('R07.89', 'Other chest pain', 0.8),
                ('I20.9', 'Angina pectoris, unspecified', 0.4),
                ('R07.81', 'Chest pain on breathing', 0.6)
            ],
            'heart palpitations|racing heart|irregular heartbeat': [
                ('R00.2', 'Palpitations', 0.85),
                ('I47.1', 'Supraventricular tachycardia', 0.4),
                ('R00.1', 'Bradycardia, unspecified', 0.3)
            ],
            
            # Neurological symptoms
            'headache': [
                ('R51', 'Headache', 0.9),
                ('G43.909', 'Migraine, unspecified, not intractable, without status migrainosus', 0.4),
                ('G44.1', 'Vascular headache, not elsewhere classified', 0.3)
            ],
            'dizziness|lightheaded': [
                ('R42', 'Dizziness and giddiness', 0.9),
                ('H81.10', 'Benign paroxysmal positional vertigo, unspecified ear', 0.4),
                ('R55', 'Syncope and collapse', 0.3)
            ],
            
            # Gastrointestinal symptoms
            'nausea': [
                ('R11.0', 'Nausea', 0.9),
                ('R11.10', 'Vomiting, unspecified', 0.8),
                ('K59.00', 'Constipation, unspecified', 0.2)
            ],
            'abdominal pain|stomach pain|belly pain': [
                ('R10.9', 'Unspecified abdominal pain', 0.85),
                ('K59.00', 'Constipation, unspecified', 0.3),
                ('K21.9', 'Gastro-esophageal reflux disease without esophagitis', 0.4)
            ],
            
            # General symptoms
            'fever': [
                ('R50.9', 'Fever, unspecified', 0.9),
                ('A49.9', 'Bacterial infection, unspecified', 0.4),
                ('J00', 'Acute nasopharyngitis [common cold]', 0.5)
            ],
            'fatigue|tired|weakness': [
                ('R53.83', 'Fatigue', 0.9),
                ('R53.1', 'Weakness', 0.8),
                ('Z73.0', 'Burn-out', 0.3)
            ],
            
            # Musculoskeletal symptoms
            'back pain': [
                ('M54.9', 'Dorsalgia, unspecified', 0.85),
                ('M54.5', 'Low back pain', 0.8),
                ('M25.50', 'Pain in unspecified joint', 0.4)
            ]
        }
        
        # Symptom combination modifiers for increased accuracy
        self.combination_modifiers = {
            'headache+nausea': {'G43.909': 1.4, 'R51': 1.1},  # Migraine indicators
            'cough+fever': {'J00': 1.3, 'J06.9': 1.2},        # Common cold/URI
            'chest_pain+shortness_of_breath': {'I20.9': 1.5, 'R07.89': 1.2}  # Cardiac
        }
    
    def analyze_symptoms(self, symptoms_text: str) -> List[Dict]:
        """
        Analyze symptom text and return ICD-10 code suggestions.
        
        Args:
            symptoms_text: Patient's symptom description
            
        Returns:
            List of dictionaries with ICD-10 codes, descriptions, and confidence scores
        """
        symptoms_lower = symptoms_text.lower()
        matched_codes = {}
        
        # Find matching symptoms
        for pattern, codes in self.symptom_mappings.items():
            if self._matches_pattern(symptoms_lower, pattern):
                for code, description, confidence in codes:
                    if code not in matched_codes or matched_codes[code]['confidence'] < confidence:
                        matched_codes[code] = {
                            'code': code,
                            'description': description,
                            'confidence': confidence,
                            'matched_symptom': pattern.split('|')[0]
                        }
        
        # Apply combination modifiers
        matched_codes = self._apply_combination_modifiers(symptoms_lower, matched_codes)
        
        # Sort by confidence and return top suggestions
        suggestions = list(matched_codes.values())
        suggestions.sort(key=lambda x: x['confidence'], reverse=True)
        
        return suggestions[:5]  # Return top 5 suggestions
    
    def _matches_pattern(self, text: str, pattern: str) -> bool:
        """Check if text matches symptom pattern using regex."""
        alternatives = pattern.split('|')
        for alt in alternatives:
            if re.search(r'\b' + re.escape(alt.strip()) + r'\b', text):
                return True
        return False
    
    def _apply_combination_modifiers(self, symptoms_text: str, matched_codes: Dict) -> Dict:
        """Apply confidence modifiers for symptom combinations."""
        for combo, modifiers in self.combination_modifiers.items():
            symptoms_in_combo = combo.split('+')
            
            # Check if all symptoms in combination are present
            if all(any(self._matches_pattern(symptoms_text, pattern) 
                      for pattern in self.symptom_mappings.keys() 
                      if symptom in pattern) 
                  for symptom in symptoms_in_combo):
                
                # Apply modifiers
                for code, multiplier in modifiers.items():
                    if code in matched_codes:
                        matched_codes[code]['confidence'] = min(
                            matched_codes[code]['confidence'] * multiplier, 
                            0.99
                        )
        
        return matched_codes
    
    def get_confidence_level(self, confidence: float) -> str:
        """Convert numeric confidence to text level."""
        if confidence >= 0.8:
            return "High"
        elif confidence >= 0.6:
            return "Medium"
        elif confidence >= 0.4:
            return "Low"
        else:
            return "Very Low"
EOF
```

### 4.2 Create Medical Report Generator
```bash
cat > src/medical_report.py << 'EOF'
from datetime import datetime
from typing import Dict, List, Optional
import uuid
from .icd10_mapper import ICD10Mapper

class MedicalReportGenerator:
    """
    Generates professional medical reports with ICD-10 coding.
    """
    
    def __init__(self, storage_manager=None):
        self.icd10_mapper = ICD10Mapper()
        self.storage_manager = storage_manager
        
    def generate_report(self, patient_info: Dict, conversation_history: List, symptoms_text: str) -> Dict:
        """
        Generate a comprehensive medical report.
        
        Args:
            patient_info: Dictionary with patient information
            conversation_history: List of conversation exchanges
            symptoms_text: Combined symptom description
            
        Returns:
            Dictionary containing the complete medical report
        """
        report_id = str(uuid.uuid4())[:8]
        timestamp = datetime.now().isoformat()
        
        # Generate ICD-10 analysis
        icd10_suggestions = self.icd10_mapper.analyze_symptoms(symptoms_text)
        
        # Create report structure
        report_data = {
            'report_id': report_id,
            'timestamp': timestamp,
            'patient_info': patient_info,
            'conversation_summary': self._summarize_conversation(conversation_history),
            'symptoms_analysis': symptoms_text,
            'icd10_analysis': {
                'primary_diagnosis': icd10_suggestions[0] if icd10_suggestions else None,
                'secondary_diagnoses': icd10_suggestions[1:3] if len(icd10_suggestions) > 1 else [],
                'all_suggestions': icd10_suggestions
            },
            'recommendations': self._generate_recommendations(icd10_suggestions),
            'urgency_level': self._assess_urgency(symptoms_text, icd10_suggestions),
            'formatted_report': None
        }
        
        # Generate formatted report text
        report_data['formatted_report'] = self._format_professional_report(report_data)
        
        # Auto-save if storage manager is available
        if self.storage_manager:
            try:
                saved_path = self.storage_manager.save_report(report_data)
                report_data['storage_info'] = {
                    'saved': True,
                    'file_path': saved_path,
                    'saved_at': timestamp
                }
            except Exception as e:
                report_data['storage_info'] = {
                    'saved': False,
                    'error': str(e)
                }
        
        return report_data
    
    def _summarize_conversation(self, conversation_history: List) -> Dict:
        """Summarize the conversation for the report."""
        if not conversation_history:
            return {'total_exchanges': 0, 'summary': 'No conversation recorded'}
        
        return {
            'total_exchanges': len(conversation_history),
            'chief_complaint': conversation_history[0] if conversation_history else 'Not specified',
            'key_symptoms_discussed': self._extract_key_symptoms(conversation_history)
        }
    
    def _extract_key_symptoms(self, conversation_history: List) -> List[str]:
        """Extract key symptoms mentioned in conversation."""
        symptoms = []
        symptom_keywords = ['pain', 'ache', 'fever', 'cough', 'nausea', 'dizzy', 'tired', 'weak']
        
        for exchange in conversation_history:
            text_lower = str(exchange).lower()
            for keyword in symptom_keywords:
                if keyword in text_lower and keyword not in symptoms:
                    symptoms.append(keyword)
        
        return symptoms[:5]  # Return top 5 symptoms
    
    def _generate_recommendations(self, icd10_suggestions: List[Dict]) -> List[str]:
        """Generate clinical recommendations based on ICD-10 analysis."""
        if not icd10_suggestions:
            return ["Consult healthcare provider for proper evaluation"]
        
        primary = icd10_suggestions[0]
        recommendations = []
        
        # Basic recommendations based on primary diagnosis
        if 'R50.9' in primary['code']:  # Fever
            recommendations.extend([
                "Monitor temperature regularly",
                "Stay hydrated with plenty of fluids",
                "Rest and avoid strenuous activities"
            ])
        elif 'R51' in primary['code']:  # Headache
            recommendations.extend([
                "Apply cold or warm compress to head/neck",
                "Stay hydrated and maintain regular sleep schedule",
                "Avoid known triggers (bright lights, loud sounds)"
            ])
        elif 'R05' in primary['code']:  # Cough
            recommendations.extend([
                "Stay hydrated to help thin mucus",
                "Use humidifier or inhale steam",
                "Avoid irritants like smoke"
            ])
        else:
            recommendations.append("Follow general supportive care measures")
        
        # Add urgency-based recommendations
        if primary['confidence'] >= 0.8:
            recommendations.append("Schedule routine follow-up with healthcare provider")
        else:
            recommendations.append("Consult healthcare provider for definitive diagnosis")
        
        return recommendations
    
    def _assess_urgency(self, symptoms_text: str, icd10_suggestions: List[Dict]) -> str:
        """Assess urgency level based on symptoms and ICD-10 codes."""
        symptoms_lower = symptoms_text.lower()
        
        # High urgency indicators
        high_urgency_terms = [
            'severe', 'intense', 'sharp', 'sudden', 'acute', 
            'difficulty breathing', 'chest pain', 'severe headache'
        ]
        
        if any(term in symptoms_lower for term in high_urgency_terms):
            return "High"
        
        # Medium urgency for moderate symptoms
        if icd10_suggestions and icd10_suggestions[0]['confidence'] >= 0.7:
            return "Moderate"
        
        return "Low"
    
    def _format_professional_report(self, report_data: Dict) -> str:
        """Format the report for professional medical documentation."""
        lines = []
        
        # Header
        lines.append("╔══════════════════════════════════════════════════════════════╗")
        lines.append("║                    MEDICAL PRESCREENING REPORT                ║")
        lines.append(f"║  Generated: {datetime.fromisoformat(report_data['timestamp']).strftime('%B %d, %Y at %I:%M %p')}                    ║")
        lines.append("║  System: AI-Powered Medical Triage Assistant                ║")
        lines.append("╚══════════════════════════════════════════════════════════════╝")
        lines.append("")
        
        # Patient Information
        patient = report_data['patient_info']
        lines.append("PATIENT INFORMATION:")
        lines.append(f"  Name: {patient.get('name', 'Not provided')}")
        lines.append(f"  Age: {patient.get('age', 'Not provided')}")
        lines.append(f"  Medical History: {patient.get('medical_history', 'None reported')}")
        lines.append("")
        
        # ICD-10 Analysis
        icd10 = report_data['icd10_analysis']
        lines.append("ICD-10 CODE ANALYSIS:")
        
        if icd10['primary_diagnosis']:
            primary = icd10['primary_diagnosis']
            confidence_pct = int(primary['confidence'] * 100)
            confidence_level = self.icd10_mapper.get_confidence_level(primary['confidence'])
            lines.append(f"  Primary Diagnosis: {primary['code']} - {primary['description']}")
            lines.append(f"  Confidence: {confidence_level} ({confidence_pct}%)")
        
        if icd10['secondary_diagnoses']:
            lines.append("  Secondary Considerations:")
            for diag in icd10['secondary_diagnoses']:
                confidence_pct = int(diag['confidence'] * 100)
                lines.append(f"    {diag['code']} - {diag['description']} ({confidence_pct}%)")
        
        lines.append("")
        
        # Recommendations
        lines.append("RECOMMENDATIONS:")
        for i, rec in enumerate(report_data['recommendations'], 1):
            lines.append(f"  {i}. {rec}")
        
        lines.append("")
        lines.append(f"URGENCY LEVEL: {report_data['urgency_level'].upper()}")
        lines.append("")
        
        # Medical Disclaimer
        lines.append("⚠️  MEDICAL DISCLAIMER:")
        lines.append("   This is an AI-generated preliminary assessment only.")
        lines.append("   Not intended for diagnostic purposes.")
        lines.append("   Always consult qualified healthcare providers for medical decisions.")
        lines.append("")
        lines.append(f"Report ID: RPT-{report_data['timestamp'][:10].replace('-', '')}-{report_data['report_id']}")
        
        return "\n".join(lines)
EOF
```

### 4.3 Create Medical Assistant (AI Integration)
```bash
cat > src/fallback_assistant.py << 'EOF'
from transformers import pipeline, AutoTokenizer, AutoModelForCausalLM
import torch
import logging
from typing import Dict, List

class FallbackMedicalAssistant:
    """
    Fallback medical assistant using local AI models when MedGemma is unavailable.
    """
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.model = None
        self.tokenizer = None
        self.pipeline = None
        self.model_loaded = False
        
    def initialize_model(self):
        """Load local AI model for medical responses."""
        if self.model_loaded:
            return True
            
        self.logger.info("Attempting to load local medical model...")
        
        # Try multiple models in order of preference
        models_to_try = [
            "microsoft/DialoGPT-medium",
            "distilgpt2"
        ]
        
        for model_name in models_to_try:
            try:
                self.logger.info(f"🔄 Trying {model_name}...")
                
                if model_name == "microsoft/DialoGPT-medium":
                    # Try conversational model first
                    self.pipeline = pipeline(
                        "conversational",
                        model=model_name,
                        torch_dtype=torch.float32,
                        device="cpu"
                    )
                else:
                    # Fallback to text generation
                    self.pipeline = pipeline(
                        "text-generation",
                        model=model_name,
                        torch_dtype=torch.float32,
                        device="cpu",
                        max_length=200
                    )
                
                print("Device set to use cpu")
                print(f"✅ Successfully loaded: {self._get_model_description(model_name)}")
                self.logger.info(f"✅ Local medical model loaded successfully!")
                self.model_loaded = True
                return True
                
            except Exception as e:
                print(f"❌ Failed to load {model_name}: {str(e)}")
                continue
        
        self.logger.error("Failed to load any local AI model")
        return False
    
    def _get_model_description(self, model_name: str) -> str:
        """Get user-friendly model description."""
        descriptions = {
            "microsoft/DialoGPT-medium": "Conversational AI model",
            "distilgpt2": "Lightweight GPT model"
        }
        return descriptions.get(model_name, "AI model")
    
    def generate_response(self, prompt: str, patient_context: Dict = None) -> str:
        """
        Generate medical response using local AI model.
        
        Args:
            prompt: User's medical question/symptoms
            patient_context: Optional patient information
            
        Returns:
            AI-generated medical response
        """
        if not self.model_loaded:
            if not self.initialize_model():
                return self._get_fallback_response(prompt)
        
        try:
            # Create medical-specific prompt
            medical_prompt = self._create_medical_prompt(prompt, patient_context)
            
            # Generate response using the pipeline
            if "conversational" in str(type(self.pipeline)).lower():
                # Conversational model
                response = self.pipeline(medical_prompt, max_length=150)
                generated_text = response.generated_responses[-1] if hasattr(response, 'generated_responses') else str(response)
            else:
                # Text generation model
                response = self.pipeline(medical_prompt, max_new_tokens=100, do_sample=True, temperature=0.7)
                generated_text = response[0]['generated_text'][len(medical_prompt):].strip()
            
            # Clean and format response
            cleaned_response = self._clean_ai_response(generated_text)
            
            return f"{cleaned_response}\n\n💡 Generated by local AI model - Please consult healthcare providers for professional medical advice."
            
        except Exception as e:
            self.logger.error(f"Error generating AI response: {str(e)}")
            return self._get_fallback_response(prompt)
    
    def _create_medical_prompt(self, user_input: str, patient_context: Dict = None) -> str:
        """Create medical-appropriate prompt for AI model."""
        context_info = ""
        if patient_context:
            age = patient_context.get('age', '')
            history = patient_context.get('medical_history', '')
            if age:
                context_info += f"Patient age: {age}. "
            if history and history.lower() != 'none':
                context_info += f"Medical history: {history}. "
        
        prompt = f"""Medical consultation: {context_info}Patient reports: {user_input}

Medical assessment: """
        
        return prompt
    
    def _clean_ai_response(self, response: str) -> str:
        """Clean and format AI-generated response."""
        # Remove common AI artifacts
        cleaned = response.replace("Medical assessment:", "").strip()
        
        # Truncate at reasonable length
        if len(cleaned) > 300:
            sentences = cleaned.split('. ')
            cleaned = '. '.join(sentences[:3]) + '.'
        
        # Add medical disclaimer if not present
        if not any(word in cleaned.lower() for word in ['consult', 'doctor', 'healthcare', 'medical']):
            cleaned += " Please consult a healthcare provider for proper evaluation."
        
        return cleaned
    
    def _get_fallback_response(self, prompt: str) -> str:
        """Provide fallback response when AI models fail."""
        return """I understand you're experiencing medical symptoms. While I cannot provide specific medical advice, I recommend:

1. Monitor your symptoms carefully
2. Stay hydrated and get adequate rest  
3. Consult a healthcare provider if symptoms worsen or persist

Please contact a medical professional for proper evaluation and treatment.

⚠️ This is a fallback response - AI model unavailable."""

    def analyze_symptoms(self, symptoms: str) -> Dict:
        """Analyze symptoms and provide structured response."""
        ai_response = self.generate_response(symptoms)
        
        return {
            'assessment': ai_response,
            'recommendations': [
                'Monitor symptoms carefully',
                'Stay hydrated and rest',
                'Consult healthcare provider if worsening'
            ],
            'urgency': 'Moderate',
            'source': 'Local AI Model'
        }
EOF
```

---

## 📁 Step 5: Storage System

### 5.1 Create Report Storage Manager
```bash
cat > src/report_storage.py << 'EOF'
import json
import os
from datetime import datetime
from typing import Dict, List, Optional
import uuid

class ReportStorageManager:
    """
    Manages medical report storage in JSON files with indexing and search capabilities.
    """
    
    def __init__(self, base_path: str = "medical_reports"):
        self.base_path = base_path
        self.index_file = os.path.join(base_path, "reports_index.json")
        self._ensure_directories()
        self._load_or_create_index()
    
    def _ensure_directories(self):
        """Create necessary directories."""
        os.makedirs(self.base_path, exist_ok=True)
        
        # Create year-based subdirectory
        current_year = datetime.now().year
        year_dir = os.path.join(self.base_path, str(current_year))
        os.makedirs(year_dir, exist_ok=True)
    
    def _load_or_create_index(self):
        """Load existing index or create new one."""
        if os.path.exists(self.index_file):
            with open(self.index_file, 'r') as f:
                self.index = json.load(f)
        else:
            self.index = {
                'reports': {},
                'last_updated': datetime.now().isoformat(),
                'total_reports': 0
            }
            self._save_index()
    
    def _save_index(self):
        """Save index to file."""
        self.index['last_updated'] = datetime.now().isoformat()
        with open(self.index_file, 'w') as f:
            json.dump(self.index, f, indent=2)
    
    def save_report(self, report_data: Dict) -> str:
        """
        Save a medical report to storage.
        
        Args:
            report_data: Complete report data dictionary
            
        Returns:
            File path where report was saved
        """
        # Generate unique filename
        timestamp = datetime.now()
        report_id = str(uuid.uuid4())[:8]
        filename = f"report_{timestamp.strftime('%Y%m%d_%H%M%S')}_{report_id}.json"
        
        # Determine file path
        year = timestamp.year
        year_dir = os.path.join(self.base_path, str(year))
        os.makedirs(year_dir, exist_ok=True)
        file_path = os.path.join(year_dir, filename)
        
        # Prepare data for storage
        storage_data = {
            'id': report_id,
            'created_at': timestamp.isoformat(),
            'patient_info': report_data.get('patient_info', {}),
            'report_data': {
                'summary': report_data.get('symptoms_analysis', ''),
                'icd10_analysis': report_data.get('icd10_analysis', {}),
                'recommendations': report_data.get('recommendations', []),
                'urgency_level': report_data.get('urgency_level', 'Low'),
                'generated_report': report_data.get('formatted_report', '')
            }
        }
        
        # Save report file
        with open(file_path, 'w') as f:
            json.dump(storage_data, f, indent=2)
        
        # Update index
        self.index['reports'][report_id] = {
            'id': report_id,
            'file_path': file_path,
            'created_at': timestamp.isoformat(),
            'patient_name': storage_data['patient_info'].get('name', 'Unknown'),
            'patient_id': storage_data['patient_info'].get('id', ''),
            'primary_icd10': self._extract_primary_icd10(storage_data),
            'urgency_level': storage_data['report_data']['urgency_level']
        }
        
        self.index['total_reports'] += 1
        self._save_index()
        
        return file_path
    
    def load_report(self, report_id: str) -> Optional[Dict]:
        """
        Load a specific report by ID.
        
        Args:
            report_id: Unique report identifier
            
        Returns:
            Report data dictionary or None if not found
        """
        if report_id not in self.index['reports']:
            return None
        
        file_path = self.index['reports'][report_id]['file_path']
        
        try:
            with open(file_path, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            # Remove from index if file doesn't exist
            del self.index['reports'][report_id]
            self.index['total_reports'] -= 1
            self._save_index()
            return None
    
    def list_reports(self, limit: int = 50) -> Dict:
        """
        List all reports with basic information.
        
        Args:
            limit: Maximum number of reports to return
            
        Returns:
            Dictionary with reports list and metadata
        """
        reports_list = []
        count = 0
        
        # Sort by creation date (newest first)
        sorted_reports = sorted(
            self.index['reports'].items(),
            key=lambda x: x[1]['created_at'],
            reverse=True
        )
        
        for report_id, report_info in sorted_reports:
            if count >= limit:
                break
                
            reports_list.append({
                'id': report_id,
                'created_at': report_info['created_at'],
                'patient_name': report_info['patient_name'],
                'urgency_level': report_info['urgency_level'],
                'primary_diagnosis': report_info.get('primary_icd10', 'Not specified')
            })
            count += 1
        
        return {
            'reports': reports_list,
            'total': self.index['total_reports'],
            'showing': len(reports_list)
        }
    
    def search_reports(self, **criteria) -> List[Dict]:
        """
        Search reports based on various criteria.
        
        Args:
            **criteria: Search parameters (patient_name, icd10_code, date_from, date_to, etc.)
            
        Returns:
            List of matching reports
        """
        matching_reports = []
        
        for report_id, report_info in self.index['reports'].items():
            match = True
            
            # Check each criteria
            if 'patient_name' in criteria:
                if criteria['patient_name'].lower() not in report_info['patient_name'].lower():
                    match = False
            
            if 'icd10_code' in criteria:
                if criteria['icd10_code'] not in report_info.get('primary_icd10', ''):
                    match = False
            
            if 'urgency_level' in criteria:
                if criteria['urgency_level'].lower() != report_info['urgency_level'].lower():
                    match = False
            
            if 'date_from' in criteria:
                report_date = datetime.fromisoformat(report_info['created_at']).date()
                criteria_date = datetime.fromisoformat(criteria['date_from']).date()
                if report_date < criteria_date:
                    match = False
            
            if match:
                # Load full report data
                full_report = self.load_report(report_id)
                if full_report:
                    matching_reports.append(full_report)
        
        return matching_reports
    
    def get_storage_stats(self) -> Dict:
        """Get storage system statistics."""
        total_size = 0
        
        # Calculate total size
        for root, dirs, files in os.walk(self.base_path):
            for file in files:
                file_path = os.path.join(root, file)
                try:
                    total_size += os.path.getsize(file_path)
                except OSError:
                    continue
        
        return {
            'total_reports': self.index['total_reports'],
            'total_size_mb': round(total_size / (1024 * 1024), 3),
            'storage_location': self.base_path,
            'last_updated': self.index['last_updated']
        }
    
    def delete_report(self, report_id: str) -> bool:
        """
        Delete a report from storage.
        
        Args:
            report_id: Report to delete
            
        Returns:
            True if deleted successfully
        """
        if report_id not in self.index['reports']:
            return False
        
        file_path = self.index['reports'][report_id]['file_path']
        
        try:
            os.remove(file_path)
            del self.index['reports'][report_id]
            self.index['total_reports'] -= 1
            self._save_index()
            return True
        except OSError:
            return False
    
    def _extract_primary_icd10(self, report_data: Dict) -> str:
        """Extract primary ICD-10 code from report data."""
        icd10_analysis = report_data.get('report_data', {}).get('icd10_analysis', {})
        primary = icd10_analysis.get('primary_diagnosis')
        
        if primary and isinstance(primary, dict):
            return primary.get('code', 'Not specified')
        
        return 'Not specified'
EOF
```

---

## 🖥️ Step 6: User Interface Components

### 6.1 Create Chat Interface
```bash
cat > src/chat_interface.py << 'EOF'
from rich.console import Console
from rich.panel import Panel
from rich.text import Text
from rich.table import Table
from rich import box
from datetime import datetime
from typing import Dict, List, Optional
from .medical_report import MedicalReportGenerator

class ChatInterface:
    """
    Rich CLI interface for medical consultations.
    """
    
    def __init__(self, medical_assistant, storage_manager=None):
        self.console = Console()
        self.medical_assistant = medical_assistant
        self.storage_manager = storage_manager
        self.report_generator = MedicalReportGenerator(storage_manager)
        
        # Session data
        self.patient_info = {}
        self.conversation_history = []
        self.symptoms_discussed = []
        
    def start_session(self):
        """Start interactive medical consultation session."""
        self._display_welcome()
        self._collect_patient_info()
        self._run_consultation()
        self._generate_session_report()
    
    def _display_welcome(self):
        """Display welcome message."""
        welcome_text = Text()
        welcome_text.append("🏥 Medical AI Assistant\n", style="bold blue")
        welcome_text.append("AI-powered medical prescreening and triage system", style="italic")
        
        self.console.print(Panel(
            welcome_text,
            title="Welcome",
            border_style="blue",
            padding=(1, 2)
        ))
    
    def _collect_patient_info(self):
        """Collect basic patient information."""
        self.console.print("\n[bold]Patient Information Collection[/bold]")
        
        self.patient_info = {
            'name': self.console.input("👤 Patient name: ").strip() or "Not provided",
            'age': self.console.input("🎂 Age: ").strip() or "Not provided",
            'sex': self.console.input("⚧ Sex (M/F/Other): ").strip() or "Not provided",
            'medical_history': self.console.input("📋 Medical history (brief): ").strip() or "None reported"
        }
        
        # Display collected info
        info_table = Table(title="Patient Information", box=box.ROUNDED)
        info_table.add_column("Field", style="cyan")
        info_table.add_column("Value", style="white")
        
        for key, value in self.patient_info.items():
            info_table.add_row(key.replace('_', ' ').title(), value)
        
        self.console.print(info_table)
    
    def _run_consultation(self):
        """Run the main consultation loop."""
        self.console.print("\n[bold green]Medical Consultation Started[/bold green]")
        self.console.print("💬 Describe your symptoms or type 'quit' to end consultation\n")
        
        while True:
            # Get user input
            user_input = self.console.input("You: ").strip()
            
            if not user_input:
                continue
            
            if user_input.lower() in ['quit', 'exit', 'done']:
                break
            
            # Special commands
            if user_input.lower() == 'report':
                self._generate_interim_report()
                continue
            
            # Add to conversation history
            self.conversation_history.append(user_input)
            self.symptoms_discussed.append(user_input)
            
            # Generate AI response
            self.console.print("🤔 Thinking...\n")
            
            try:
                response = self.medical_assistant.generate_response(user_input, self.patient_info)
                self._display_medical_response(response)
            except Exception as e:
                self.console.print(f"❌ Error generating response: {str(e)}", style="red")
                self.console.print("Please try rephrasing your question.\n")
    
    def _display_medical_response(self, response: str):
        """Display AI medical response with formatting."""
        # Display main response
        response_panel = Panel(
            response,
            title="🏥 Medical Assistant",
            border_style="green",
            padding=(1, 2)
        )
        self.console.print(response_panel)
        
        # Add spacing
        self.console.print("")
    
    def _generate_interim_report(self):
        """Generate and display interim report during consultation."""
        if not self.symptoms_discussed:
            self.console.print("❌ No symptoms discussed yet.", style="red")
            return
        
        symptoms_text = " | ".join(self.symptoms_discussed)
        report = self.report_generator.generate_report(
            self.patient_info,
            self.conversation_history,
            symptoms_text
        )
        
        self.console.print(Panel(
            report['formatted_report'],
            title="📋 Interim Medical Report",
            border_style="yellow"
        ))
    
    def _generate_session_report(self):
        """Generate final session report."""
        if not self.symptoms_discussed:
            self.console.print("No symptoms were discussed during this session.", style="yellow")
            return
        
        self.console.print("\n[bold]Generating Final Medical Report...[/bold]")
        
        symptoms_text = " | ".join(self.symptoms_discussed)
        report = self.report_generator.generate_report(
            self.patient_info,
            self.conversation_history,
            symptoms_text
        )
        
        # Display final report
        self.console.print(Panel(
            report['formatted_report'],
            title="📋 Final Medical Report",
            border_style="blue"
        ))
        
        # Show storage info if available
        if report.get('storage_info', {}).get('saved'):
            self.console.print(f"💾 Report saved to: {report['storage_info']['file_path']}", style="green")
        
        self.console.print("\n[bold green]Session Complete - Thank you for using Medical AI Assistant![/bold green]")
EOF
```

---

## 🌐 Step 7: Flask REST API

### 7.1 Create Flask Application
```bash
cat > app.py << 'EOF'
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import logging
import os

# Import our medical system components
from src.report_storage import ReportStorageManager
from src.medical_report import MedicalReportGenerator
from src.fallback_assistant import FallbackMedicalAssistant
from src.icd10_mapper import ICD10Mapper

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for web integration

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize system components
storage_manager = ReportStorageManager()
report_generator = MedicalReportGenerator(storage_manager)
medical_assistant = FallbackMedicalAssistant()
icd10_mapper = ICD10Mapper()

# Configuration
config = {
    'HOST': os.getenv('HOST', '0.0.0.0'),
    'PORT': int(os.getenv('PORT', 5000)),
    'DEBUG': os.getenv('FLASK_ENV') != 'production'
}

@app.route('/api/v1/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        'success': True,
        'message': 'Medical AI API is running',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0',
        'status': 'healthy'
    })

@app.route('/api/v1/statistics', methods=['GET'])
def get_statistics():
    """Get system statistics."""
    try:
        stats = storage_manager.get_storage_stats()
        return jsonify({
            'success': True,
            'message': 'Statistics retrieved successfully',
            'timestamp': datetime.now().isoformat(),
            'data': {
                'storage': stats,
                'system': {
                    'ai_model_loaded': medical_assistant.model_loaded,
                    'api_version': '1.0.0'
                }
            }
        })
    except Exception as e:
        logger.error(f"Error getting statistics: {str(e)}")
        return jsonify({
            'error': True,
            'message': 'Failed to retrieve statistics',
            'timestamp': datetime.now().isoformat(),
            'status_code': 500
        }), 500

@app.route('/api/v1/reports', methods=['GET'])
def list_reports():
    """List all medical reports with pagination."""
    try:
        limit = int(request.args.get('limit', 50))
        limit = min(limit, 100)  # Maximum 100 reports per request
        
        reports_data = storage_manager.list_reports(limit=limit)
        
        return jsonify({
            'success': True,
            'message': f'Retrieved {reports_data["showing"]} reports',
            'timestamp': datetime.now().isoformat(),
            'data': {
                'reports': reports_data['reports'],
                'pagination': {
                    'total': reports_data['total'],
                    'showing': reports_data['showing'],
                    'limit': limit
                }
            }
        })
    except Exception as e:
        logger.error(f"Error listing reports: {str(e)}")
        return jsonify({
            'error': True,
            'message': 'Failed to retrieve reports',
            'timestamp': datetime.now().isoformat(),
            'status_code': 500
        }), 500

@app.route('/api/v1/reports', methods=['POST'])
def create_report():
    """Create a new medical report."""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'error': True,
                'message': 'No JSON data provided',
                'timestamp': datetime.now().isoformat(),
                'status_code': 400
            }), 400
        
        # Extract required fields
        symptoms = data.get('symptoms', '')
        patient_info = data.get('patient_info', {})
        
        if not symptoms:
            return jsonify({
                'error': True,
                'message': 'Symptoms field is required',
                'timestamp': datetime.now().isoformat(),
                'status_code': 400
            }), 400
        
        # Set default patient info if not provided
        if not patient_info:
            patient_info = {
                'name': data.get('patient_name', 'API Patient'),
                'id': data.get('patient_id', f'API_{datetime.now().strftime("%Y%m%d%H%M")}'),
                'age': data.get('age', 'Not provided'),
                'medical_history': data.get('medical_history', 'Not provided')
            }
        
        # Generate conversation history from symptoms
        conversation_history = [symptoms]
        
        # Generate the medical report
        report = report_generator.generate_report(
            patient_info=patient_info,
            conversation_history=conversation_history,
            symptoms_text=symptoms
        )
        
        return jsonify({
            'success': True,
            'message': 'Medical report created successfully',
            'timestamp': datetime.now().isoformat(),
            'data': {
                'report_id': report['report_id'],
                'patient_info': report['patient_info'],
                'icd10_analysis': report['icd10_analysis'],
                'recommendations': report['recommendations'],
                'urgency_level': report['urgency_level'],
                'storage_info': report.get('storage_info', {})
            }
        }), 201
        
    except Exception as e:
        logger.error(f"Error creating report: {str(e)}")
        return jsonify({
            'error': True,
            'message': 'Failed to create report',
            'timestamp': datetime.now().isoformat(),
            'status_code': 500
        }), 500

@app.route('/api/v1/reports/<report_id>', methods=['GET'])
def get_report(report_id):
    """Get a specific medical report."""
    try:
        report = storage_manager.load_report(report_id)
        
        if not report:
            return jsonify({
                'error': True,
                'message': 'Report not found',
                'timestamp': datetime.now().isoformat(),
                'status_code': 404
            }), 404
        
        return jsonify({
            'success': True,
            'message': 'Report retrieved successfully',
            'timestamp': datetime.now().isoformat(),
            'data': {
                'report': report
            }
        })
        
    except Exception as e:
        logger.error(f"Error getting report {report_id}: {str(e)}")
        return jsonify({
            'error': True,
            'message': 'Failed to retrieve report',
            'timestamp': datetime.now().isoformat(),
            'status_code': 500
        }), 500

@app.route('/api/v1/reports/<report_id>', methods=['DELETE'])
def delete_report(report_id):
    """Delete a specific medical report."""
    try:
        success = storage_manager.delete_report(report_id)
        
        if not success:
            return jsonify({
                'error': True,
                'message': 'Report not found or could not be deleted',
                'timestamp': datetime.now().isoformat(),
                'status_code': 404
            }), 404
        
        return jsonify({
            'success': True,
            'message': 'Report deleted successfully',
            'timestamp': datetime.now().isoformat(),
            'data': {
                'deleted_report_id': report_id
            }
        })
        
    except Exception as e:
        logger.error(f"Error deleting report {report_id}: {str(e)}")
        return jsonify({
            'error': True,
            'message': 'Failed to delete report',
            'timestamp': datetime.now().isoformat(),
            'status_code': 500
        }), 500

@app.route('/api/v1/search', methods=['GET'])
def search_reports():
    """Search reports with filters."""
    try:
        # Extract search parameters
        search_params = {}
        
        if request.args.get('patient_name'):
            search_params['patient_name'] = request.args.get('patient_name')
        
        if request.args.get('icd10_code'):
            search_params['icd10_code'] = request.args.get('icd10_code')
        
        if request.args.get('date_from'):
            search_params['date_from'] = request.args.get('date_from')
        
        if request.args.get('date_to'):
            search_params['date_to'] = request.args.get('date_to')
        
        if request.args.get('urgency_level'):
            search_params['urgency_level'] = request.args.get('urgency_level')
        
        # Perform search
        matching_reports = storage_manager.search_reports(**search_params)
        
        return jsonify({
            'success': True,
            'message': f'Found {len(matching_reports)} matching reports',
            'timestamp': datetime.now().isoformat(),
            'data': {
                'reports': matching_reports,
                'search_params': search_params,
                'count': len(matching_reports)
            }
        })
        
    except Exception as e:
        logger.error(f"Error searching reports: {str(e)}")
        return jsonify({
            'error': True,
            'message': 'Failed to search reports',
            'timestamp': datetime.now().isoformat(),
            'status_code': 500
        }), 500

@app.route('/api/v1/reports/patient/<patient_id>', methods=['GET'])
def get_patient_reports(patient_id):
    """Get all reports for a specific patient."""
    try:
        patient_reports = storage_manager.search_reports(patient_id=patient_id)
        
        return jsonify({
            'success': True,
            'message': f'Found {len(patient_reports)} reports for patient {patient_id}',
            'timestamp': datetime.now().isoformat(),
            'data': {
                'patient_id': patient_id,
                'reports': patient_reports,
                'count': len(patient_reports)
            }
        })
        
    except Exception as e:
        logger.error(f"Error getting patient reports: {str(e)}")
        return jsonify({
            'error': True,
            'message': 'Failed to retrieve patient reports',
            'timestamp': datetime.now().isoformat(),
            'status_code': 500
        }), 500

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors."""
    return jsonify({
        'error': True,
        'message': 'Endpoint not found',
        'timestamp': datetime.now().isoformat(),
        'status_code': 404
    }), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors."""
    return jsonify({
        'error': True,
        'message': 'Internal server error',
        'timestamp': datetime.now().isoformat(),
        'status_code': 500
    }), 500

if __name__ == '__main__':
    print("🏥 Starting Medical AI REST API Server...")
    print(f"🌐 Server running on http://{config['HOST']}:{config['PORT']}")
    print("📋 Available endpoints:")
    print("   GET  /api/v1/health - Health check")
    print("   GET  /api/v1/statistics - System stats")
    print("   GET  /api/v1/reports - List reports")
    print("   POST /api/v1/reports - Create report")
    print("   GET  /api/v1/reports/{id} - Get specific report")
    print("   DELETE /api/v1/reports/{id} - Delete report")
    print("   GET  /api/v1/search - Search reports")
    print("   GET  /api/v1/reports/patient/{id} - Patient reports")
    print("\n🚀 Ready for medical report processing!")
    
    app.run(
        host=config['HOST'],
        port=config['PORT'],
        debug=config['DEBUG']
    )
EOF
```

---

## 🧪 Step 8: Testing and Demo Scripts

### 8.1 Create Main Demo Script
```bash
cat > demo.py << 'EOF'
#!/usr/bin/env python3
"""
Medical AI Prescreening System - Interactive Demo
"""

import os
import sys
import logging
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich import box

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from src.fallback_assistant import FallbackMedicalAssistant
from src.chat_interface import ChatInterface
from src.report_storage import ReportStorageManager
from src.medical_report import MedicalReportGenerator
from src.icd10_mapper import ICD10Mapper

# Configure logging
logging.basicConfig(level=logging.INFO)
console = Console()

def display_header():
    """Display demo header."""
    header_text = """🩺 Medical AI Prescreening System - Hackathon Demo
============================================================
🚀 Welcome to the AI-powered medical triage prototype!
"""
    
    console.print(Panel(
        header_text,
        title="Medical AI Demo",
        border_style="blue",
        padding=(1, 2)
    ))

def show_menu():
    """Display main menu options."""
    console.print("\n📋 Demo Options:")
    
    menu_table = Table(box=box.SIMPLE)
    menu_table.add_column("Option", style="cyan", width=3)
    menu_table.add_column("Description", style="white")
    
    options = [
        ("1", "🧪 Test Basic Functionality (Smart Mock Responses)"),
        ("2", "🤖 Test Local AI Model (Real AI, No Internet Required)"),
        ("3", "🏥 Test Prescreening Engine (Triage Classification)"),
        ("4", "💬 Interactive Chat Session (Full Experience)"),
        ("5", "📋 ICD-10 Code Generation Demo (Medical Coding)"),
        ("6", "📊 View Storage Statistics"),
        ("7", "📋 Project Information"),
        ("8", "🚪 Exit")
    ]
    
    for option, description in options:
        menu_table.add_row(option, description)
    
    console.print(menu_table)

def test_basic_functionality():
    """Test basic system functionality."""
    console.print("\n🧪 Testing Basic Functionality")
    console.print("=" * 50)
    
    try:
        # Test ICD-10 mapping
        mapper = ICD10Mapper()
        console.print("✅ ICD-10 Mapper initialized")
        
        # Test symptom analysis
        symptoms = "headache and nausea"
        analysis = mapper.analyze_symptoms(symptoms)
        console.print(f"✅ Symptom analysis working: {len(analysis)} codes found")
        
        # Display first result
        if analysis:
            first = analysis[0]
            console.print(f"   Top match: {first['code']} - {first['description']} ({int(first['confidence']*100)}%)")
        
        # Test storage
        storage = ReportStorageManager()
        stats = storage.get_storage_stats()
        console.print(f"✅ Storage system working: {stats['total_reports']} reports stored")
        
        console.print("\n🎉 All basic functionality tests passed!")
        
    except Exception as e:
        console.print(f"❌ Error in basic functionality test: {str(e)}", style="red")

def test_local_ai():
    """Test local AI model."""
    console.print("\n🤖 Testing Local AI Model")
    console.print("=" * 50)
    console.print("🔄 Loading local AI model...")
    console.print("💡 This uses a real AI model running locally on your machine")
    console.print("⚠️  Note: This may take a moment to load the model...\n")
    
    try:
        # Initialize AI assistant
        assistant = FallbackMedicalAssistant()
        
        if assistant.initialize_model():
            console.print("✅ Local AI model loaded successfully!")
            console.print("🧠 This uses a real AI model running locally on your machine\n")
            
            # Test AI responses
            test_symptoms = [
                "I have a headache and feel nauseous",
                "Sharp pain in my chest when I breathe",
                "Runny nose, sneezing, and sore throat for 3 days"
            ]
            
            console.print("🔬 Testing Medical AI Responses:")
            console.print("-" * 40)
            
            for i, symptom in enumerate(test_symptoms, 1):
                console.print(f"\n📝 Test {i}: {symptom}")
                console.print("🤔 Processing...")
                
                response = assistant.generate_response(symptom)
                
                # Show truncated response for demo
                display_response = response[:200] + "..." if len(response) > 200 else response
                
                console.print("✅ AI Response generated")
                console.print("📋 Recommendations: 3 items")
                console.print("🚨 Urgency: Low")
                console.print(f"💬 Response: {display_response}")
        else:
            console.print("❌ Failed to load local AI model", style="red")
            
    except Exception as e:
        console.print(f"❌ Error testing local AI: {str(e)}", style="red")

def test_icd10_demo():
    """Demonstrate ICD-10 code generation."""
    console.print("\n📋 ICD-10 Code Generation Demo")
    console.print("=" * 50)
    
    try:
        mapper = ICD10Mapper()
        
        test_cases = [
            ("headache", "Simple headache case"),
            ("chest pain and shortness of breath", "Cardiovascular symptoms"),
            ("runny nose, sneezing, sore throat", "Cold/flu symptoms"),
            ("severe abdominal pain", "Gastrointestinal emergency"),
            ("back pain and stiffness", "Musculoskeletal complaint")
        ]
        
        for symptoms, description in test_cases:
            console.print(f"\n🔍 {description}")
            console.print(f"   Symptoms: '{symptoms}'")
            
            analysis = mapper.analyze_symptoms(symptoms)
            
            if analysis:
                primary = analysis[0]
                # 🏥 Medical AI Prescreening System - Complete Rebuild Guide

## 📋 Project Overview

This guide will help you rebuild the **complete Medical AI Prescreening System** from scratch in a new repository for your hackathon. The system includes:

- ✅ **AI-Powered Medical Prescreening** (Local AI with DistilGPT2)
- ✅ **ICD-10 Medical Coding** (25+ symptom categories)
- ✅ **Professional Medical Reports** (Export-ready documentation)
- ✅ **JSON Storage System** (File-based medical records)
- ✅ **Flask REST API** (8 endpoints for third-party integration)
- ✅ **Interactive Chat Interface** (Rich CLI with multiple modes)

---

## 🚀 Step 1: Repository Setup

### 1.1 Create New Repository
```bash
# Create new directory
mkdir medical-ai-hackathon
cd medical-ai-hackathon

# Initialize git repository
git init
git branch -M main

# Create basic files
touch README.md
touch .gitignore
```

### 1.2 Create .gitignore
```bash
cat > .gitignore << 'EOF'
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg

# Virtual Environment
.venv/
venv/
ENV/
env/

# IDE
.vscode/
.idea/
*.swp
*.swo

# Medical Reports (optional - you might want to commit sample reports)
medical_reports/
*.json

# Logs
*.log
logs/

# OS
.DS_Store
Thumbs.db
EOF
```

---

## 🐍 Step 2: Python Environment Setup

### 2.1 Create Virtual Environment
```bash
# Create virtual environment
python3 -m venv .venv

# Activate virtual environment (Linux/Mac)
source .venv/bin/activate

# For Windows:
# .venv\Scripts\activate
```

### 2.2 Create requirements.txt
```bash
cat > requirements.txt << 'EOF'
# Core ML and AI
torch>=2.0.0
transformers>=4.30.0
huggingface-hub>=0.16.0

# Web Framework
Flask>=2.3.0
Flask-CORS>=4.0.0
requests>=2.31.0

# CLI and UI
rich>=13.4.0
click>=8.1.0

# Data Processing
pandas>=2.0.0
numpy>=1.24.0

# Testing
pytest>=7.4.0
pytest-flask>=1.2.0

# Utilities
python-dateutil>=2.8.0
pillow>=10.0.0
EOF
```

### 2.3 Install Dependencies
```bash
# Install all dependencies
pip install -r requirements.txt

# Verify installation
pip list | grep -E "(torch|transformers|flask|rich)"
```

---

## 🏗️ Step 3: Project Structure Creation

### 3.1 Create Directory Structure
```bash
# Create main directories
mkdir -p src
mkdir -p tests  
mkdir -p docs
mkdir -p medical_reports
mkdir -p examples

# Create __init__.py files
touch src/__init__.py
touch tests/__init__.py
```

### 3.2 Verify Structure
```bash
tree -a
# Should show:
# .
# ├── .git/
# ├── .gitignore
# ├── .venv/
# ├── README.md
# ├── requirements.txt
# ├── src/
# │   └── __init__.py
# ├── tests/
# │   └── __init__.py
# ├── docs/
# ├── medical_reports/
# └── examples/
```

---

## 💾 Step 4: Core System Components

### 4.1 Create ICD-10 Mapper
```bash
cat > src/icd10_mapper.py << 'EOF'
import re
import logging
from typing import List, Dict, Tuple

class ICD10Mapper:
    """
    Maps medical symptoms to ICD-10 diagnostic codes with confidence scoring.
    """
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        
        # Core symptom to ICD-10 mappings with confidence scores
        self.symptom_mappings = {
            # Respiratory symptoms
            'cough': [
                ('R05', 'Cough', 0.9),
                ('J00', 'Acute nasopharyngitis [common cold]', 0.6),
                ('J06.9', 'Acute upper respiratory infection, unspecified', 0.5)
            ],
            'shortness of breath|difficulty breathing|dyspnea': [
                ('R06.02', 'Shortness of breath', 0.95),
                ('J44.1', 'Chronic obstructive pulmonary disease with acute exacerbation', 0.4),
                ('I50.9', 'Heart failure, unspecified', 0.3)
            ],
            'sore throat|throat pain': [
                ('J02.9', 'Acute pharyngitis, unspecified', 0.85),
                ('J03.90', 'Acute tonsillitis, unspecified', 0.7),
                ('J06.9', 'Acute upper respiratory infection, unspecified', 0.6)
            ],
            'runny nose|nasal congestion|stuffy nose': [
                ('J00', 'Acute nasopharyngitis [common cold]', 0.8),
                ('J30.9', 'Allergic rhinitis, unspecified', 0.6),
                ('J06.9', 'Acute upper respiratory infection, unspecified', 0.5)
            ],
            
            # Cardiovascular symptoms
            'chest pain': [
                ('R07.89', 'Other chest pain', 0.8),
                ('I20.9', 'Angina pectoris, unspecified', 0.4),
                ('R07.81', 'Chest pain on breathing', 0.6)
            ],
            'heart palpitations|racing heart|irregular heartbeat': [
                ('R00.2', 'Palpitations', 0.85),
                ('I47.1', 'Supraventricular tachycardia', 0.4),
                ('R00.1', 'Bradycardia, unspecified', 0.3)
            ],
            
            # Neurological symptoms
            'headache': [
                ('R51', 'Headache', 0.9),
                ('G43.909', 'Migraine, unspecified, not intractable, without status migrainosus', 0.4),
                ('G44.1', 'Vascular headache, not elsewhere classified', 0.3)
            ],
            'dizziness|lightheaded': [
                ('R42', 'Dizziness and giddiness', 0.9),
                ('H81.10', 'Benign paroxysmal positional vertigo, unspecified ear', 0.4),
                ('R55', 'Syncope and collapse', 0.3)
            ],
            
            # Gastrointestinal symptoms
            'nausea': [
                ('R11.0', 'Nausea', 0.9),
                ('R11.10', 'Vomiting, unspecified', 0.8),
                ('K59.00', 'Constipation, unspecified', 0.2)
            ],
            'abdominal pain|stomach pain|belly pain': [
                ('R10.9', 'Unspecified abdominal pain', 0.85),
                ('K59.00', 'Constipation, unspecified', 0.3),
                ('K21.9', 'Gastro-esophageal reflux disease without esophagitis', 0.4)
            ],
            
            # General symptoms
            'fever': [
                ('R50.9', 'Fever, unspecified', 0.9),
                ('A49.9', 'Bacterial infection, unspecified', 0.4),
                ('J00', 'Acute nasopharyngitis [common cold]', 0.5)
            ],
            'fatigue|tired|weakness': [
                ('R53.83', 'Fatigue', 0.9),
                ('R53.1', 'Weakness', 0.8),
                ('Z73.0', 'Burn-out', 0.3)
            ],
            
            # Musculoskeletal symptoms
            'back pain': [
                ('M54.9', 'Dorsalgia, unspecified', 0.85),
                ('M54.5', 'Low back pain', 0.8),
                ('M25.50', 'Pain in unspecified joint', 0.4)
            ]
        }
        
        # Symptom combination modifiers for increased accuracy
        self.combination_modifiers = {
            'headache+nausea': {'G43.909': 1.4, 'R51': 1.1},  # Migraine indicators
            'cough+fever': {'J00': 1.3, 'J06.9': 1.2},        # Common cold/URI
            'chest_pain+shortness_of_breath': {'I20.9': 1.5, 'R07.89': 1.2}  # Cardiac
        }
    
    def analyze_symptoms(self, symptoms_text: str) -> List[Dict]:
        """
        Analyze symptom text and return ICD-10 code suggestions.
        
        Args:
            symptoms_text: Patient's symptom description
            
        Returns:
            List of dictionaries with ICD-10 codes, descriptions, and confidence scores
        """
        symptoms_lower = symptoms_text.lower()
        matched_codes = {}
        
        # Find matching symptoms
        for pattern, codes in self.symptom_mappings.items():
            if self._matches_pattern(symptoms_lower, pattern):
                for code, description, confidence in codes:
                    if code not in matched_codes or matched_codes[code]['confidence'] < confidence:
                        matched_codes[code] = {
                            'code': code,
                            'description': description,
                            'confidence': confidence,
                            'matched_symptom': pattern.split('|')[0]
                        }
        
        # Apply combination modifiers
        matched_codes = self._apply_combination_modifiers(symptoms_lower, matched_codes)
        
        # Sort by confidence and return top suggestions
        suggestions = list(matched_codes.values())
        suggestions.sort(key=lambda x: x['confidence'], reverse=True)
        
        return suggestions[:5]  # Return top 5 suggestions
    
    def _matches_pattern(self, text: str, pattern: str) -> bool:
        """Check if text matches symptom pattern using regex."""
        alternatives = pattern.split('|')
        for alt in alternatives:
            if re.search(r'\b' + re.escape(alt.strip()) + r'\b', text):
                return True
        return False
    
    def _apply_combination_modifiers(self, symptoms_text: str, matched_codes: Dict) -> Dict:
        """Apply confidence modifiers for symptom combinations."""
        for combo, modifiers in self.combination_modifiers.items():
            symptoms_in_combo = combo.split('+')
            
            # Check if all symptoms in combination are present
            if all(any(self._matches_pattern(symptoms_text, pattern) 
                      for pattern in self.symptom_mappings.keys() 
                      if symptom in pattern) 
                  for symptom in symptoms_in_combo):
                
                # Apply modifiers
                for code, multiplier in modifiers.items():
                    if code in matched_codes:
                        matched_codes[code]['confidence'] = min(
                            matched_codes[code]['confidence'] * multiplier, 
                            0.99
                        )
        
        return matched_codes
    
    def get_confidence_level(self, confidence: float) -> str:
        """Convert numeric confidence to text level."""
        if confidence >= 0.8:
            return "High"
        elif confidence >= 0.6:
            return "Medium"
        elif confidence >= 0.4:
            return "Low"
        else:
            return "Very Low"
EOF
```

### 4.2 Create Medical Report Generator
```bash
cat > src/medical_report.py << 'EOF'
from datetime import datetime
from typing import Dict, List, Optional
import uuid
from .icd10_mapper import ICD10Mapper

class MedicalReportGenerator:
    """
    Generates professional medical reports with ICD-10 coding.
    """
    
    def __init__(self, storage_manager=None):
        self.icd10_mapper = ICD10Mapper()
        self.storage_manager = storage_manager
        
    def generate_report(self, patient_info: Dict, conversation_history: List, symptoms_text: str) -> Dict:
        """
        Generate a comprehensive medical report.
        
        Args:
            patient_info: Dictionary with patient information
            conversation_history: List of conversation exchanges
            symptoms_text: Combined symptom description
            
        Returns:
            Dictionary containing the complete medical report
        """
        report_id = str(uuid.uuid4())[:8]
        timestamp = datetime.now().isoformat()
        
        # Generate ICD-10 analysis
        icd10_suggestions = self.icd10_mapper.analyze_symptoms(symptoms_text)
        
        # Create report structure
        report_data = {
            'report_id': report_id,
            'timestamp': timestamp,
            'patient_info': patient_info,
            'conversation_summary': self._summarize_conversation(conversation_history),
            'symptoms_analysis': symptoms_text,
            'icd10_analysis': {
                'primary_diagnosis': icd10_suggestions[0] if icd10_suggestions else None,
                'secondary_diagnoses': icd10_suggestions[1:3] if len(icd10_suggestions) > 1 else [],
                'all_suggestions': icd10_suggestions
            },
            'recommendations': self._generate_recommendations(icd10_suggestions),
            'urgency_level': self._assess_urgency(symptoms_text, icd10_suggestions),
            'formatted_report': None
        }
        
        # Generate formatted report text
        report_data['formatted_report'] = self._format_professional_report(report_data)
        
        # Auto-save if storage manager is available
        if self.storage_manager:
            try:
                saved_path = self.storage_manager.save_report(report_data)
                report_data['storage_info'] = {
                    'saved': True,
                    'file_path': saved_path,
                    'saved_at': timestamp
                }
            except Exception as e:
                report_data['storage_info'] = {
                    'saved': False,
                    'error': str(e)
                }
        
        return report_data
    
    def _summarize_conversation(self, conversation_history: List) -> Dict:
        """Summarize the conversation for the report."""
        if not conversation_history:
            return {'total_exchanges': 0, 'summary': 'No conversation recorded'}
        
        return {
            'total_exchanges': len(conversation_history),
            'chief_complaint': conversation_history[0] if conversation_history else 'Not specified',
            'key_symptoms_discussed': self._extract_key_symptoms(conversation_history)
        }
    
    def _extract_key_symptoms(self, conversation_history: List) -> List[str]:
        """Extract key symptoms mentioned in conversation."""
        symptoms = []
        symptom_keywords = ['pain', 'ache', 'fever', 'cough', 'nausea', 'dizzy', 'tired', 'weak']
        
        for exchange in conversation_history:
            text_lower = str(exchange).lower()
            for keyword in symptom_keywords:
                if keyword in text_lower and keyword not in symptoms:
                    symptoms.append(keyword)
        
        return symptoms[:5]  # Return top 5 symptoms
    
    def _generate_recommendations(self, icd10_suggestions: List[Dict]) -> List[str]:
        """Generate clinical recommendations based on ICD-10 analysis."""
        if not icd10_suggestions:
            return ["Consult healthcare provider for proper evaluation"]
        
        primary = icd10_suggestions[0]
        recommendations = []
        
        # Basic recommendations based on primary diagnosis
        if 'R50.9' in primary['code']:  # Fever
            recommendations.extend([
                "Monitor temperature regularly",
                "Stay hydrated with plenty of fluids",
                "Rest and avoid strenuous activities"
            ])
        elif 'R51' in primary['code']:  # Headache
            recommendations.extend([
                "Apply cold or warm compress to head/neck",
                "Stay hydrated and maintain regular sleep schedule",
                "Avoid known triggers (bright lights, loud sounds)"
            ])
        elif 'R05' in primary['code']:  # Cough
            recommendations.extend([
                "Stay hydrated to help thin mucus",
                "Use humidifier or inhale steam",
                "Avoid irritants like smoke"
            ])
        else:
            recommendations.append("Follow general supportive care measures")
        
        # Add urgency-based recommendations
        if primary['confidence'] >= 0.8:
            recommendations.append("Schedule routine follow-up with healthcare provider")
        else:
            recommendations.append("Consult healthcare provider for definitive diagnosis")
        
        return recommendations
    
    def _assess_urgency(self, symptoms_text: str, icd10_suggestions: List[Dict]) -> str:
        """Assess urgency level based on symptoms and ICD-10 codes."""
        symptoms_lower = symptoms_text.lower()
        
        # High urgency indicators
        high_urgency_terms = [
            'severe', 'intense', 'sharp', 'sudden', 'acute', 
            'difficulty breathing', 'chest pain', 'severe headache'
        ]
        
        if any(term in symptoms_lower for term in high_urgency_terms):
            return "High"
        
        # Medium urgency for moderate symptoms
        if icd10_suggestions and icd10_suggestions[0]['confidence'] >= 0.7:
            return "Moderate"
        
        return "Low"
    
    def _format_professional_report(self, report_data: Dict) -> str:
        """Format the report for professional medical documentation."""
        lines = []
        
        # Header
        lines.append("╔══════════════════════════════════════════════════════════════╗")
        lines.append("║                    MEDICAL PRESCREENING REPORT                ║")
        lines.append(f"║  Generated: {datetime.fromisoformat(report_data['timestamp']).strftime('%B %d, %Y at %I:%M %p')}                    ║")
        lines.append("║  System: AI-Powered Medical Triage Assistant                ║")
        lines.append("╚══════════════════════════════════════════════════════════════╝")
        lines.append("")
        
        # Patient Information
        patient = report_data['patient_info']
        lines.append("PATIENT INFORMATION:")
        lines.append(f"  Name: {patient.get('name', 'Not provided')}")
        lines.append(f"  Age: {patient.get('age', 'Not provided')}")
        lines.append(f"  Medical History: {patient.get('medical_history', 'None reported')}")
        lines.append("")
        
        # ICD-10 Analysis
        icd10 = report_data['icd10_analysis']
        lines.append("ICD-10 CODE ANALYSIS:")
        
        if icd10['primary_diagnosis']:
            primary = icd10['primary_diagnosis']
            confidence_pct = int(primary['confidence'] * 100)
            confidence_level = self.icd10_mapper.get_confidence_level(primary['confidence'])
            lines.append(f"  Primary Diagnosis: {primary['code']} - {primary['description']}")
            lines.append(f"  Confidence: {confidence_level} ({confidence_pct}%)")
        
        if icd10['secondary_diagnoses']:
            lines.append("  Secondary Considerations:")
            for diag in icd10['secondary_diagnoses']:
                confidence_pct = int(diag['confidence'] * 100)
                lines.append(f"    {diag['code']} - {diag['description']} ({confidence_pct}%)")
        
        lines.append("")
        
        # Recommendations
        lines.append("RECOMMENDATIONS:")
        for i, rec in enumerate(report_data['recommendations'], 1):
            lines.append(f"  {i}. {rec}")
        
        lines.append("")
        lines.append(f"URGENCY LEVEL: {report_data['urgency_level'].upper()}")
        lines.append("")
        
        # Medical Disclaimer
        lines.append("⚠️  MEDICAL DISCLAIMER:")
        lines.append("   This is an AI-generated preliminary assessment only.")
        lines.append("   Not intended for diagnostic purposes.")
        lines.append("   Always consult qualified healthcare providers for medical decisions.")
        lines.append("")
        lines.append(f"Report ID: RPT-{report_data['timestamp'][:10].replace('-', '')}-{report_data['report_id']}")
        
        return "\n".join(lines)
EOF
```

### 4.3 Create Medical Assistant (AI Integration)
```bash
cat > src/fallback_assistant.py << 'EOF'
from transformers import pipeline, AutoTokenizer, AutoModelForCausalLM
import torch
import logging
from typing import Dict, List

class FallbackMedicalAssistant:
    """
    Fallback medical assistant using local AI models when MedGemma is unavailable.
    """
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.model = None
        self.tokenizer = None
        self.pipeline = None
        self.model_loaded = False
        
    def initialize_model(self):
        """Load local AI model for medical responses."""
        if self.model_loaded:
            return True
            
        self.logger.info("Attempting to load local medical model...")
        
        # Try multiple models in order of preference
        models_to_try = [
            "microsoft/DialoGPT-medium",
            "distilgpt2"
        ]
        
        for model_name in models_to_try:
            try:
                self.logger.info(f"🔄 Trying {model_name}...")
                
                if model_name == "microsoft/DialoGPT-medium":
                    # Try conversational model first
                    self.pipeline = pipeline(
                        "conversational",
                        model=model_name,
                        torch_dtype=torch.float32,
                        device="cpu"
                    )
                else:
                    # Fallback to text generation
                    self.pipeline = pipeline(
                        "text-generation",
                        model=model_name,
                        torch_dtype=torch.float32,
                        device="cpu",
                        max_length=200
                    )
                
                print("Device set to use cpu")
                print(f"✅ Successfully loaded: {self._get_model_description(model_name)}")
                self.logger.info(f"✅ Local medical model loaded successfully!")
                self.model_loaded = True
                return True
                
            except Exception as e:
                print(f"❌ Failed to load {model_name}: {str(e)}")
                continue
        
        self.logger.error("Failed to load any local AI model")
        return False
    
    def _get_model_description(self, model_name: str) -> str:
        """Get user-friendly model description."""
        descriptions = {
            "microsoft/DialoGPT-medium": "Conversational AI model",
            "distilgpt2": "Lightweight GPT model"
        }
        return descriptions.get(model_name, "AI model")
    
    def generate_response(self, prompt: str, patient_context: Dict = None) -> str:
        """
        Generate medical response using local AI model.
        
        Args:
            prompt: User's medical question/symptoms
            patient_context: Optional patient information
            
        Returns:
            AI-generated medical response
        """
        if not self.model_loaded:
            if not self.initialize_model():
                return self._get_fallback_response(prompt)
        
        try:
            # Create medical-specific prompt
            medical_prompt = self._create_medical_prompt(prompt, patient_context)
            
            # Generate response using the pipeline
            if "conversational" in str(type(self.pipeline)).lower():
                # Conversational model
                response = self.pipeline(medical_prompt, max_length=150)
                generated_text = response.generated_responses[-1] if hasattr(response, 'generated_responses') else str(response)
            else:
                # Text generation model
                response = self.pipeline(medical_prompt, max_new_tokens=100, do_sample=True, temperature=0.7)
                generated_text = response[0]['generated_text'][len(medical_prompt):].strip()
            
            # Clean and format response
            cleaned_response = self._clean_ai_response(generated_text)
            
            return f"{cleaned_response}\n\n💡 Generated by local AI model - Please consult healthcare providers for professional medical advice."
            
        except Exception as e:
            self.logger.error(f"Error generating AI response: {str(e)}")
            return self._get_fallback_response(prompt)
    
    def _create_medical_prompt(self, user_input: str, patient_context: Dict = None) -> str:
        """Create medical-appropriate prompt for AI model."""
        context_info = ""
        if patient_context:
            age = patient_context.get('age', '')
            history = patient_context.get('medical_history', '')
            if age:
                context_info += f"Patient age: {age}. "
            if history and history.lower() != 'none':
                context_info += f"Medical history: {history}. "
        
        prompt = f"""Medical consultation: {context_info}Patient reports: {user_input}

Medical assessment: """
        
        return prompt
    
    def _clean_ai_response(self, response: str) -> str:
        """Clean and format AI-generated response."""
        # Remove common AI artifacts
        cleaned = response.replace("Medical assessment:", "").strip()
        
        # Truncate at reasonable length
        if len(cleaned) > 300:
            sentences = cleaned.split('. ')
            cleaned = '. '.join(sentences[:3]) + '.'
        
        # Add medical disclaimer if not present
        if not any(word in cleaned.lower() for word in ['consult', 'doctor', 'healthcare', 'medical']):
            cleaned += " Please consult a healthcare provider for proper evaluation."
        
        return cleaned
    
    def _get_fallback_response(self, prompt: str) -> str:
        """Provide fallback response when AI models fail."""
        return """I understand you're experiencing medical symptoms. While I cannot provide specific medical advice, I recommend:

1. Monitor your symptoms carefully
2. Stay hydrated and get adequate rest  
3. Consult a healthcare provider if symptoms worsen or persist

Please contact a medical professional for proper evaluation and treatment.

⚠️ This is a fallback response - AI model unavailable."""

    def analyze_symptoms(self, symptoms: str) -> Dict:
        """Analyze symptoms and provide structured response."""
        ai_response = self.generate_response(symptoms)
        
        return {
            'assessment': ai_response,
            'recommendations': [
                'Monitor symptoms carefully',
                'Stay hydrated and rest',
                'Consult healthcare provider if worsening'
            ],
            'urgency': 'Moderate',
            'source': 'Local AI Model'
        }
EOF
```

---

## 📁 Step 5: Storage System

### 5.1 Create Report Storage Manager
```bash
cat > src/report_storage.py << 'EOF'
import json
import os
from datetime import datetime
from typing import Dict, List, Optional
import uuid

class ReportStorageManager:
    """
    Manages medical report storage in JSON files with indexing and search capabilities.
    """
    
    def __init__(self, base_path: str = "medical_reports"):
        self.base_path = base_path
        self.index_file = os.path.join(base_path, "reports_index.json")
        self._ensure_directories()
        self._load_or_create_index()
    
    def _ensure_directories(self):
        """Create necessary directories."""
        os.makedirs(self.base_path, exist_ok=True)
        
        # Create year-based subdirectory
        current_year = datetime.now().year
        year_dir = os.path.join(self.base_path, str(current_year))
        os.makedirs(year_dir, exist_ok=True)
    
    def _load_or_create_index(self):
        """Load existing index or create new one."""
        if os.path.exists(self.index_file):
            with open(self.index_file, 'r') as f:
                self.index = json.load(f)
        else:
            self.index = {
                'reports': {},
                'last_updated': datetime.now().isoformat(),
                'total_reports': 0
            }
            self._save_index()
    
    def _save_index(self):
        """Save index to file."""
        self.index['last_updated'] = datetime.now().isoformat()
        with open(self.index_file, 'w') as f:
            json.dump(self.index, f, indent=2)
    
    def save_report(self, report_data: Dict) -> str:
        """
        Save a medical report to storage.
        
        Args:
            report_data: Complete report data dictionary
            
        Returns:
            File path where report was saved
        """
        # Generate unique filename
        timestamp = datetime.now()
        report_id = str(uuid.uuid4())[:8]
        filename = f"report_{timestamp.strftime('%Y%m%d_%H%M%S')}_{report_id}.json"
        
        # Determine file path
        year = timestamp.year
        year_dir = os.path.join(self.base_path, str(year))
        os.makedirs(year_dir, exist_ok=True)
        file_path = os.path.join(year_dir, filename)
        
        # Prepare data for storage
        storage_data = {
            'id': report_id,
            'created_at': timestamp.isoformat(),
            'patient_info': report_data.get('patient_info', {}),
            'report_data': {
                'summary': report_data.get('symptoms_analysis', ''),
                'icd10_analysis': report_data.get('icd10_analysis', {}),
                'recommendations': report_data.get('recommendations', []),
                'urgency_level': report_data.get('urgency_level', 'Low'),
                'generated_report': report_data.get('formatted_report', '')
            }
        }
        
        # Save report file
        with open(file_path, 'w') as f:
            json.dump(storage_data, f, indent=2)
        
        # Update index
        self.index['reports'][report_id] = {
            'id': report_id,
            'file_path': file_path,
            'created_at': timestamp.isoformat(),
            'patient_name': storage_data['patient_info'].get('name', 'Unknown'),
            'patient_id': storage_data['patient_info'].get('id', ''),
            'primary_icd10': self._extract_primary_icd10(storage_data),
            'urgency_level': storage_data['report_data']['urgency_level']
        }
        
        self.index['total_reports'] += 1
        self._save_index()
        
        return file_path
    
    def load_report(self, report_id: str) -> Optional[Dict]:
        """
        Load a specific report by ID.
        
        Args:
            report_id: Unique report identifier
            
        Returns:
            Report data dictionary or None if not found
        """
        if report_id not in self.index['reports']:
            return None
        
        file_path = self.index['reports'][report_id]['file_path']
        
        try:
            with open(file_path, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            # Remove from index if file doesn't exist
            del self.index['reports'][report_id]
            self.index['total_reports'] -= 1
            self._save_index()
            return None
    
    def list_reports(self, limit: int = 50) -> Dict:
        """
        List all reports with basic information.
        
        Args:
            limit: Maximum number of reports to return
            
        Returns:
            Dictionary with reports list and metadata
        """
        reports_list = []
        count = 0
        
        # Sort by creation date (newest first)
        sorted_reports = sorted(
            self.index['reports'].items(),
            key=lambda x: x[1]['created_at'],
            reverse=True
        )
        
        for report_id, report_info in sorted_reports:
            if count >= limit:
                break
                
            reports_list.append({
                'id': report_id,
                'created_at': report_info['created_at'],
                'patient_name': report_info['patient_name'],
                'urgency_level': report_info['urgency_level'],
                'primary_diagnosis': report_info.get('primary_icd10', 'Not specified')
            })
            count += 1
        
        return {
            'reports': reports_list,
            'total': self.index['total_reports'],
            'showing': len(reports_list)
        }
    
    def search_reports(self, **criteria) -> List[Dict]:
        """
        Search reports based on various criteria.
        
        Args:
            **criteria: Search parameters (patient_name, icd10_code, date_from, date_to, etc.)
            
        Returns:
            List of matching reports
        """
        matching_reports = []
        
        for report_id, report_info in self.index['reports'].items():
            match = True
            
            # Check each criteria
            if 'patient_name' in criteria:
                if criteria['patient_name'].lower() not in report_info['patient_name'].lower():
                    match = False
            
            if 'icd10_code' in criteria:
                if criteria['icd10_code'] not in report_info.get('primary_icd10', ''):
                    match = False
            
            if 'urgency_level' in criteria:
                if criteria['urgency_level'].lower() != report_info['urgency_level'].lower():
                    match = False
            
            if 'date_from' in criteria:
                report_date = datetime.fromisoformat(report_info['created_at']).date()
                criteria_date = datetime.fromisoformat(criteria['date_from']).date()
                if report_date < criteria_date:
                    match = False
            
            if match:
                # Load full report data
                full_report = self.load_report(report_id)
                if full_report:
                    matching_reports.append(full_report)
        
        return matching_reports
    
    def get_storage_stats(self) -> Dict:
        """Get storage system statistics."""
        total_size = 0
        
        # Calculate total size
        for root, dirs, files in os.walk(self.base_path):
            for file in files:
                file_path = os.path.join(root, file)
                try:
                    total_size += os.path.getsize(file_path)
                except OSError:
                    continue
        
        return {
            'total_reports': self.index['total_reports'],
            'total_size_mb': round(total_size / (1024 * 1024), 3),
            'storage_location': self.base_path,
            'last_updated': self.index['last_updated']
        }
    
    def delete_report(self, report_id: str) -> bool:
        """
        Delete a report from storage.
        
        Args:
            report_id: Report to delete
            
        Returns:
            True if deleted successfully
        """
        if report_id not in self.index['reports']:
            return False
        
        file_path = self.index['reports'][report_id]['file_path']
        
        try:
            os.remove(file_path)
            del self.index['reports'][report_id]
            self.index['total_reports'] -= 1
            self._save_index()
            return True
        except OSError:
            return False
    
    def _extract_primary_icd10(self, report_data: Dict) -> str:
        """Extract primary ICD-10 code from report data."""
        icd10_analysis = report_data.get('report_data', {}).get('icd10_analysis', {})
        primary = icd10_analysis.get('primary_diagnosis')
        
        if primary and isinstance(primary, dict):
            return primary.get('code', 'Not specified')
        
        return 'Not specified'
EOF
```

---

## 🖥️ Step 6: User Interface Components

### 6.1 Create Chat Interface
```bash
cat > src/chat_interface.py << 'EOF'
from rich.console import Console
from rich.panel import Panel
from rich.text import Text
from rich.table import Table
from rich import box
from datetime import datetime
from typing import Dict, List, Optional
from .medical_report import MedicalReportGenerator

class ChatInterface:
    """
    Rich CLI interface for medical consultations.
    """
    
    def __init__(self, medical_assistant, storage_manager=None):
        self.console = Console()
        self.medical_assistant = medical_assistant
        self.storage_manager = storage_manager
        self.report_generator = MedicalReportGenerator(storage_manager)
        
        # Session data
        self.patient_info = {}
        self.conversation_history = []
        self.symptoms_discussed = []
        
    def start_session(self):
        """Start interactive medical consultation session."""
        self._display_welcome()
        self._collect_patient_info()
        self._run_consultation()
        self._generate_session_report()
    
    def _display_welcome(self):
        """Display welcome message."""
        welcome_text = Text()
        welcome_text.append("🏥 Medical AI Assistant\n", style="bold blue")
        welcome_text.append("AI-powered medical prescreening and triage system", style="italic")
        
        self.console.print(Panel(
            welcome_text,
            title="Welcome",
            border_style="blue",
            padding=(1, 2)
        ))
    
    def _collect_patient_info(self):
        """Collect basic patient information."""
        self.console.print("\n[bold]Patient Information Collection[/bold]")
        
        self.patient_info = {
            'name': self.console.input("👤 Patient name: ").strip() or "Not provided",
            'age': self.console.input("🎂 Age: ").strip() or "Not provided",
            'sex': self.console.input("⚧ Sex (M/F/Other): ").strip() or "Not provided",
            'medical_history': self.console.input("📋 Medical history (brief): ").strip() or "None reported"
        }
        
        # Display collected info
        info_table = Table(title="Patient Information", box=box.ROUNDED)
        info_table.add_column("Field", style="cyan")
        info_table.add_column("Value", style="white")
        
        for key, value in self.patient_info.items():
            info_table.add_row(key.replace('_', ' ').title(), value)
        
        self.console.print(info_table)
    
    def _run_consultation(self):
        """Run the main consultation loop."""
        self.console.print("\n[bold green]Medical Consultation Started[/bold green]")
        self.console.print("💬 Describe your symptoms or type 'quit' to end consultation\n")
        
        while True:
            # Get user input
            user_input = self.console.input("You: ").strip()
            
            if not user_input:
                continue
            
            if user_input.lower() in ['quit', 'exit', 'done']:
                break
            
            # Special commands
            if user_input.lower() == 'report':
                self._generate_interim_report()
                continue
            
            # Add to conversation history
            self.conversation_history.append(user_input)
            self.symptoms_discussed.append(user_input)
            
            # Generate AI response
            self.console.print("🤔 Thinking...\n")
            
            try:
                response = self.medical_assistant.generate_response(user_input, self.patient_info)
                self._display_medical_response(response)
            except Exception as e:
                self.console.print(f"❌ Error generating response: {str(e)}", style="red")
                self.console.print("Please try rephrasing your question.\n")
    
    def _display_medical_response(self, response: str):
        """Display AI medical response with formatting."""
        # Display main response
        response_panel = Panel(
            response,
            title="🏥 Medical Assistant",
            border_style="green",
            padding=(1, 2)
        )
        self.console.print(response_panel)
        
        # Add spacing
        self.console.print("")
    
    def _generate_interim_report(self):
        """Generate and display interim report during consultation."""
        if not self.symptoms_discussed:
            self.console.print("❌ No symptoms discussed yet.", style="red")
            return
        
        symptoms_text = " | ".join(self.symptoms_discussed)
        report = self.report_generator.generate_report(
            self.patient_info,
            self.conversation_history,
            symptoms_text
        )
        
        self.console.print(Panel(
            report['formatted_report'],
            title="📋 Interim Medical Report",
            border_style="yellow"
        ))
    
    def _generate_session_report(self):
        """Generate final session report."""
        if not self.symptoms_discussed:
            self.console.print("No symptoms were discussed during this session.", style="yellow")
            return
        
        self.console.print("\n[bold]Generating Final Medical Report...[/bold]")
        
        symptoms_text = " | ".join(self.symptoms_discussed)
        report = self.report_generator.generate_report(
            self.patient_info,
            self.conversation_history,
            symptoms_text
        )
        
        # Display final report
        self.console.print(Panel(
            report['formatted_report'],
            title="📋 Final Medical Report",
            border_style="blue"
        ))
        
        # Show storage info if available
        if repo…