"""
ICD-10 Code Mapper for Medical Prescreening System
Maps symptoms to ICD-10 diagnosis codes with confidence scoring.
"""

import re
from typing import List, Dict, Tuple
import logging


class ICD10Mapper:
    """
    Maps patient symptoms to potential ICD-10 diagnosis codes.
    Uses rule-based approach with confidence scoring.
    """
    
    def __init__(self):
        """Initialize the ICD-10 mapper with symptom-to-code mappings."""
        self.logger = logging.getLogger(__name__)
        
        # Core symptom to ICD-10 mappings
        # Format: symptom_pattern: [(code, description, base_confidence)]
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
            'wheezing': [
                ('R06.2', 'Wheezing', 0.9),
                ('J45.9', 'Asthma, unspecified', 0.7),
                ('J44.1', 'COPD with acute exacerbation', 0.4)
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
            'nausea': [
                ('R11.10', 'Vomiting, unspecified', 0.8),
                ('R11.0', 'Nausea', 0.9),
                ('K59.00', 'Constipation, unspecified', 0.2)
            ],
            
            # Gastrointestinal symptoms
            'abdominal pain|stomach pain|belly pain': [
                ('R10.9', 'Unspecified abdominal pain', 0.85),
                ('K59.00', 'Constipation, unspecified', 0.3),
                ('K21.9', 'Gastro-esophageal reflux disease without esophagitis', 0.4)
            ],
            'diarrhea': [
                ('K59.1', 'Diarrhea, unspecified', 0.9),
                ('A09', 'Infectious gastroenteritis and colitis, unspecified', 0.6),
                ('K58.9', 'Irritable bowel syndrome, unspecified', 0.4)
            ],
            'constipation': [
                ('K59.00', 'Constipation, unspecified', 0.9),
                ('K59.09', 'Other constipation', 0.7)
            ],
            
            # General symptoms
            'fever': [
                ('R50.9', 'Fever, unspecified', 0.9),
                ('A49.9', 'Bacterial infection, unspecified', 0.4),
                ('J00', 'Acute nasopharyngitis [common cold]', 0.5)
            ],
            'fatigue|tired|weakness': [
                ('R53.1', 'Weakness', 0.8),
                ('R53.83', 'Fatigue', 0.9),
                ('Z73.0', 'Burn-out', 0.3)
            ],
            'joint pain|arthralgia': [
                ('M25.50', 'Pain in unspecified joint', 0.8),
                ('M79.3', 'Panniculitis, unspecified', 0.3),
                ('M25.9', 'Joint disorder, unspecified', 0.6)
            ],
            'back pain': [
                ('M54.9', 'Dorsalgia, unspecified', 0.85),
                ('M54.5', 'Low back pain', 0.8),
                ('M25.50', 'Pain in unspecified joint', 0.4)
            ],
            
            # Dermatological symptoms
            'rash|skin rash': [
                ('R21', 'Rash and other nonspecific skin eruption', 0.9),
                ('L30.9', 'Dermatitis, unspecified', 0.6),
                ('L50.9', 'Urticaria, unspecified', 0.4)
            ],
            'itching|pruritus': [
                ('L29.9', 'Pruritus, unspecified', 0.9),
                ('L30.9', 'Dermatitis, unspecified', 0.5)
            ]
        }
        
        # Symptom combinations that modify confidence
        self.combination_modifiers = {
            'fever+cough': {'J00': 1.2, 'J06.9': 1.3, 'A49.9': 0.8},
            'chest_pain+shortness_of_breath': {'I20.9': 1.5, 'R06.02': 1.2, 'R07.89': 1.1},
            'headache+nausea': {'G43.909': 1.4, 'R51': 1.1},
            'cough+sore_throat+runny_nose': {'J00': 1.4, 'J06.9': 1.3}
        }
    
    def extract_symptoms(self, text: str) -> List[str]:
        """
        Extract symptom keywords from text.
        
        Args:
            text: Input text containing symptom descriptions
            
        Returns:
            List of identified symptom patterns
        """
        text_lower = text.lower()
        found_symptoms = []
        
        for symptom_pattern in self.symptom_mappings.keys():
            # Use regex to match symptom patterns (including OR patterns with |)
            if '|' in symptom_pattern:
                # Handle OR patterns
                patterns = symptom_pattern.split('|')
                for pattern in patterns:
                    if re.search(r'\b' + pattern.strip() + r'\b', text_lower):
                        found_symptoms.append(symptom_pattern)
                        break
            else:
                # Simple keyword match
                if re.search(r'\b' + symptom_pattern + r'\b', text_lower):
                    found_symptoms.append(symptom_pattern)
        
        return list(set(found_symptoms))  # Remove duplicates
    
    def calculate_confidence(self, symptom: str, base_confidence: float, 
                           all_symptoms: List[str]) -> float:
        """
        Calculate adjusted confidence based on symptom combinations.
        
        Args:
            symptom: The symptom pattern
            base_confidence: Base confidence score
            all_symptoms: All identified symptoms for combination analysis
            
        Returns:
            Adjusted confidence score (0.0 to 1.0)
        """
        # Start with base confidence
        confidence = base_confidence
        
        # Check for symptom combinations that might modify confidence
        symptom_key = symptom.replace(' ', '_').replace('|', '_')
        
        # Look for combination modifiers
        for combo, modifiers in self.combination_modifiers.items():
            combo_symptoms = combo.split('+')
            if len(combo_symptoms) <= len(all_symptoms):
                # Check if this combination is present
                combo_match = True
                for combo_symptom in combo_symptoms:
                    if not any(combo_symptom.replace('_', ' ') in s.replace('|', ' ') 
                             for s in all_symptoms):
                        combo_match = False
                        break
                
                if combo_match and symptom_key in modifiers:
                    confidence *= modifiers[symptom_key]
        
        # Cap confidence at 1.0
        return min(confidence, 1.0)
    
    def map_symptoms_to_icd10(self, text: str, patient_info: Dict = None) -> List[Dict]:
        """
        Map symptoms in text to ICD-10 codes with confidence scores.
        
        Args:
            text: Text containing symptom descriptions
            patient_info: Optional patient information for context
            
        Returns:
            List of ICD-10 code suggestions with confidence scores
        """
        # Extract symptoms from text
        symptoms = self.extract_symptoms(text)
        
        if not symptoms:
            return []
        
        # Collect all potential codes
        code_suggestions = {}
        
        for symptom in symptoms:
            if symptom in self.symptom_mappings:
                for code, description, base_confidence in self.symptom_mappings[symptom]:
                    # Calculate adjusted confidence
                    confidence = self.calculate_confidence(symptom, base_confidence, symptoms)
                    
                    # If code already exists, use higher confidence
                    if code in code_suggestions:
                        if confidence > code_suggestions[code]['confidence']:
                            code_suggestions[code]['confidence'] = confidence
                            code_suggestions[code]['supporting_symptoms'].append(symptom)
                    else:
                        code_suggestions[code] = {
                            'code': code,
                            'description': description,
                            'confidence': confidence,
                            'supporting_symptoms': [symptom]
                        }
        
        # Convert to list and sort by confidence
        suggestions = list(code_suggestions.values())
        suggestions.sort(key=lambda x: x['confidence'], reverse=True)
        
        # Limit to top 5 suggestions
        return suggestions[:5]
    
    def format_confidence_level(self, confidence: float) -> Tuple[str, str]:
        """
        Convert confidence score to human-readable level and color.
        
        Args:
            confidence: Confidence score (0.0 to 1.0)
            
        Returns:
            Tuple of (confidence_text, color)
        """
        if confidence >= 0.8:
            return "High", "green"
        elif confidence >= 0.6:
            return "Medium", "yellow"
        elif confidence >= 0.4:
            return "Low", "orange"
        else:
            return "Very Low", "red"
    
    def generate_icd10_report(self, symptoms_text: str, patient_info: Dict = None) -> Dict:
        """
        Generate a comprehensive ICD-10 code report.
        
        Args:
            symptoms_text: Text containing patient symptoms
            patient_info: Optional patient information
            
        Returns:
            Dictionary containing formatted ICD-10 report
        """
        suggestions = self.map_symptoms_to_icd10(symptoms_text, patient_info)
        
        if not suggestions:
            return {
                'has_suggestions': False,
                'message': 'No ICD-10 codes could be mapped from the provided symptoms.',
                'suggestions': []
            }
        
        # Format suggestions with confidence levels
        formatted_suggestions = []
        for suggestion in suggestions:
            confidence_text, confidence_color = self.format_confidence_level(
                suggestion['confidence']
            )
            
            formatted_suggestions.append({
                'code': suggestion['code'],
                'description': suggestion['description'],
                'confidence_score': suggestion['confidence'],
                'confidence_text': confidence_text,
                'confidence_color': confidence_color,
                'supporting_symptoms': suggestion['supporting_symptoms'],
                'percentage': int(suggestion['confidence'] * 100)
            })
        
        return {
            'has_suggestions': True,
            'suggestions': formatted_suggestions,
            'disclaimer': (
                '⚠️  IMPORTANT: These ICD-10 codes are AI-generated suggestions only. '
                'Professional medical review and validation required for clinical use, '
                'billing, or diagnostic purposes.'
            ),
            'total_codes': len(formatted_suggestions)
        }


def demo_icd10_mapping():
    """Demo function to test ICD-10 mapping functionality."""
    mapper = ICD10Mapper()
    
    test_cases = [
        "I have a persistent cough and fever for 3 days",
        "Severe chest pain and shortness of breath",
        "Headache with nausea and dizziness",
        "Runny nose, sore throat, and feeling tired",
        "Lower back pain when walking"
    ]
    
    print("🔬 ICD-10 Mapping Demo")
    print("=" * 50)
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n📝 Test Case {i}: {test_case}")
        report = mapper.generate_icd10_report(test_case)
        
        if report['has_suggestions']:
            print(f"📋 Found {report['total_codes']} ICD-10 suggestions:")
            for suggestion in report['suggestions'][:3]:  # Show top 3
                print(f"   • {suggestion['code']}: {suggestion['description']}")
                print(f"     Confidence: {suggestion['confidence_text']} ({suggestion['percentage']}%)")
        else:
            print("❌ No ICD-10 codes identified")


if __name__ == "__main__":
    demo_icd10_mapping()