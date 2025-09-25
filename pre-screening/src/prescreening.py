"""
Medical prescreening logic and triage recommendations.
Provides structured assessment and care pathway suggestions.
"""

from typing import Dict, List, Tuple, Optional
from enum import Enum
import re
import json

try:
    from .icd10_mapper import ICD10Mapper
except ImportError:
    ICD10Mapper = None


class UrgencyLevel(Enum):
    """Urgency levels for medical triage."""
    IMMEDIATE = "immediate"  # Emergency - seek immediate care
    URGENT = "urgent"        # Within 24 hours
    MODERATE = "moderate"    # Within 2-3 days  
    LOW = "low"             # Routine care or monitoring


class TriageClassifier:
    """
    Classifies medical queries and provides triage recommendations.
    """
    
    def __init__(self):
        # Initialize ICD-10 mapper if available
        self.icd10_mapper = None
        if ICD10Mapper:
            try:
                self.icd10_mapper = ICD10Mapper()
            except Exception:
                self.icd10_mapper = None
        
        self.emergency_keywords = {
            'chest_pain': ['chest pain', 'heart attack', 'crushing pain', 'chest pressure'],
            'breathing': ['can\'t breathe', 'difficulty breathing', 'shortness of breath', 'suffocating'],
            'consciousness': ['unconscious', 'passed out', 'fainting', 'blackout', 'seizure'],
            'bleeding': ['severe bleeding', 'heavy bleeding', 'blood loss', 'hemorrhage'],
            'allergic': ['allergic reaction', 'anaphylaxis', 'severe allergy', 'swelling face'],
            'stroke': ['stroke', 'face drooping', 'arm weakness', 'speech slurred', 'sudden confusion'],
            'mental_health': ['suicide', 'self-harm', 'want to die', 'hurt myself']
        }
        
        self.urgent_keywords = {
            'severe_pain': ['severe pain', 'excruciating', 'unbearable pain', '10/10 pain'],
            'high_fever': ['high fever', 'fever over', '104', '40 degrees'],
            'infection_signs': ['infected', 'pus', 'red streak', 'spreading redness'],
            'vomiting': ['can\'t keep down', 'persistent vomiting', 'dehydrated'],
            'vision_changes': ['sudden vision loss', 'double vision', 'blind']
        }
        
        self.moderate_keywords = {
            'persistent': ['persistent', 'ongoing', 'won\'t go away', 'getting worse'],
            'fever': ['fever', 'temperature', 'chills'],
            'pain': ['pain', 'ache', 'sore', 'tender'],
            'digestive': ['nausea', 'vomiting', 'diarrhea', 'stomach'],
            'respiratory': ['cough', 'congestion', 'runny nose', 'sinus']
        }
    
    def classify_urgency(self, query: str, response_text: str = "") -> UrgencyLevel:
        """
        Classify the urgency level of a medical query.
        
        Args:
            query: Patient's medical query
            response_text: AI model's response (optional)
            
        Returns:
            UrgencyLevel enum value
        """
        combined_text = (query + " " + response_text).lower()
        
        # Check for emergency indicators
        for category, keywords in self.emergency_keywords.items():
            if any(keyword in combined_text for keyword in keywords):
                return UrgencyLevel.IMMEDIATE
        
        # Check for urgent indicators
        for category, keywords in self.urgent_keywords.items():
            if any(keyword in combined_text for keyword in keywords):
                return UrgencyLevel.URGENT
        
        # Check for moderate indicators
        for category, keywords in self.moderate_keywords.items():
            if any(keyword in combined_text for keyword in keywords):
                return UrgencyLevel.MODERATE
        
        return UrgencyLevel.LOW
    
    def get_triage_recommendations(self, urgency: UrgencyLevel, symptoms: str = "") -> List[str]:
        """
        Get specific recommendations based on urgency level.
        
        Args:
            urgency: Urgency level from classification
            symptoms: Description of symptoms for context
            
        Returns:
            List of actionable recommendations
        """
        if urgency == UrgencyLevel.IMMEDIATE:
            return [
                "🚨 Seek immediate medical attention - call 911 or go to emergency room",
                "Do not drive yourself - have someone else drive or call ambulance",
                "If alone, call emergency services and stay on the line"
            ]
        
        elif urgency == UrgencyLevel.URGENT:
            return [
                "Contact your healthcare provider within 24 hours",
                "Consider urgent care if primary care is unavailable",
                "Monitor symptoms closely and seek immediate care if they worsen"
            ]
        
        elif urgency == UrgencyLevel.MODERATE:
            return [
                "Schedule appointment with your healthcare provider within 2-3 days",
                "Monitor symptoms and keep a symptom diary",
                "Take appropriate over-the-counter medications if suitable"
            ]
        
        else:  # LOW urgency
            return [
                "Consider routine medical consultation if symptoms persist",
                "Practice self-care and monitor for any changes",
                "Schedule regular check-up with healthcare provider"
            ]


class MedicalDomainClassifier:
    """
    Classifies medical queries into clinical domains.
    """
    
    def __init__(self):
        self.domain_keywords = {
            'cardiology': ['heart', 'chest', 'cardiac', 'blood pressure', 'palpitations'],
            'pulmonology': ['lung', 'breathing', 'cough', 'respiratory', 'chest pain'],
            'gastroenterology': ['stomach', 'digestive', 'nausea', 'vomiting', 'diarrhea'],
            'neurology': ['headache', 'dizzy', 'numbness', 'weakness', 'seizure'],
            'dermatology': ['skin', 'rash', 'itch', 'mole', 'burn'],
            'orthopedics': ['bone', 'joint', 'muscle', 'back pain', 'fracture'],
            'psychiatry': ['depression', 'anxiety', 'mental health', 'stress'],
            'infectious_disease': ['fever', 'infection', 'virus', 'bacteria', 'flu']
        }
    
    def classify_domain(self, query: str) -> List[str]:
        """
        Classify medical query into potential clinical domains.
        
        Args:
            query: Medical query text
            
        Returns:
            List of relevant medical domains
        """
        query_lower = query.lower()
        relevant_domains = []
        
        for domain, keywords in self.domain_keywords.items():
            if any(keyword in query_lower for keyword in keywords):
                relevant_domains.append(domain)
        
        return relevant_domains if relevant_domains else ['general_medicine']


class PrescreeningEngine:
    """
    Main prescreening engine that combines classification and recommendations.
    """
    
    def __init__(self):
        self.triage_classifier = TriageClassifier()
        self.domain_classifier = MedicalDomainClassifier()
    
    def analyze_query(self, query: str, patient_context: Optional[Dict] = None, 
                     ai_response: str = "") -> Dict:
        """
        Perform comprehensive analysis of medical query.
        
        Args:
            query: Patient's medical query
            patient_context: Patient demographic and medical history
            ai_response: AI model's response text
            
        Returns:
            Dictionary containing analysis results
        """
        # Classify urgency and domain
        urgency = self.triage_classifier.classify_urgency(query, ai_response)
        domains = self.domain_classifier.classify_domain(query)
        
        # Get recommendations
        recommendations = self.triage_classifier.get_triage_recommendations(urgency, query)
        
        # Generate ICD-10 code suggestions if available
        icd10_suggestions = None
        if self.triage_classifier.icd10_mapper:
            try:
                icd10_report = self.triage_classifier.icd10_mapper.generate_icd10_report(
                    query, patient_context
                )
                if icd10_report['has_suggestions']:
                    # Include top 3 ICD-10 suggestions
                    icd10_suggestions = icd10_report['suggestions'][:3]
            except Exception as e:
                # Log error but continue without ICD-10
                pass
        
        # Generate follow-up questions
        follow_up_questions = self._generate_follow_up_questions(query, domains, patient_context)
        
        # Risk factors assessment
        risk_factors = self._assess_risk_factors(patient_context)
        
        # Care pathway suggestions
        care_pathway = self._suggest_care_pathway(urgency, domains)
        
        result = {
            'urgency_level': urgency.value,
            'medical_domains': domains,
            'recommendations': recommendations,
            'follow_up_questions': follow_up_questions,
            'risk_factors': risk_factors,
            'care_pathway': care_pathway,
            'next_steps': self._get_next_steps(urgency, domains)
        }
        
        # Add ICD-10 suggestions if available
        if icd10_suggestions:
            result['icd10_suggestions'] = icd10_suggestions
            result['has_icd10'] = True
        else:
            result['has_icd10'] = False
        
        return result
    
    def _generate_follow_up_questions(self, query: str, domains: List[str], 
                                    patient_context: Optional[Dict] = None) -> List[str]:
        """Generate relevant follow-up questions based on query and domain."""
        questions = []
        
        # Domain-specific questions
        if 'cardiology' in domains:
            questions.extend([
                "Do you experience the chest pain during physical activity?",
                "Have you had any family history of heart disease?"
            ])
        
        if 'pulmonology' in domains:
            questions.extend([
                "Are you experiencing shortness of breath at rest or with activity?",
                "Do you have a history of smoking or lung conditions?"
            ])
        
        if 'gastroenterology' in domains:
            questions.extend([
                "How long have you been experiencing digestive symptoms?",
                "Have you made any recent changes to your diet?"
            ])
        
        # General questions
        general_questions = [
            "When did these symptoms first start?",
            "On a scale of 1-10, how would you rate the severity?",
            "Does anything make the symptoms better or worse?",
            "Have you taken any medications for these symptoms?"
        ]
        
        # Add general questions if no specific domain questions
        if not questions:
            questions = general_questions[:2]
        
        return questions[:3]  # Limit to 3 questions
    
    def _assess_risk_factors(self, patient_context: Optional[Dict] = None) -> List[str]:
        """Assess risk factors based on patient context."""
        if not patient_context:
            return []
        
        risk_factors = []
        
        # Age-based risk factors
        age = patient_context.get('age')
        if age and isinstance(age, int):
            if age > 65:
                risk_factors.append("Advanced age (increased risk for various conditions)")
            elif age < 18:
                risk_factors.append("Pediatric patient (specialized care considerations)")
        
        # Medical history risk factors
        medical_history = patient_context.get('medical_history', '').lower()
        if 'diabetes' in medical_history:
            risk_factors.append("Diabetes (affects healing and infection risk)")
        if 'heart' in medical_history or 'cardiac' in medical_history:
            risk_factors.append("Heart disease history (cardiovascular risk factors)")
        if 'hypertension' in medical_history or 'blood pressure' in medical_history:
            risk_factors.append("Hypertension (cardiovascular complications)")
        
        return risk_factors
    
    def _suggest_care_pathway(self, urgency: UrgencyLevel, domains: List[str]) -> Dict:
        """Suggest appropriate care pathway."""
        pathway = {
            'primary_care': urgency in [UrgencyLevel.LOW, UrgencyLevel.MODERATE],
            'urgent_care': urgency == UrgencyLevel.URGENT,
            'emergency_care': urgency == UrgencyLevel.IMMEDIATE,
            'specialist_referral': len(domains) > 1 or any(d in ['cardiology', 'neurology'] for d in domains)
        }
        
        return pathway
    
    def _get_next_steps(self, urgency: UrgencyLevel, domains: List[str]) -> List[str]:
        """Get specific next steps based on urgency and domains."""
        next_steps = []
        
        if urgency == UrgencyLevel.IMMEDIATE:
            next_steps = [
                "Call 911 or go to nearest emergency room immediately",
                "Bring list of current medications and medical history",
                "Have emergency contact information ready"
            ]
        elif urgency == UrgencyLevel.URGENT:
            next_steps = [
                "Contact healthcare provider or urgent care within 24 hours",
                "Document symptoms and when they started",
                "Prepare medical history and medication list"
            ]
        else:
            next_steps = [
                "Monitor symptoms and document changes",
                "Schedule appointment with primary care provider",
                "Consider lifestyle modifications if applicable"
            ]
        
        return next_steps