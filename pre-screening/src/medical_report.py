"""
Professional Medical Report Generator
Generates export-ready medical reports for healthcare provider handoff.
"""

from typing import Dict, List, Optional
from datetime import datetime
import json
from rich.console import Console
from rich.panel import Panel
from rich.text import Text
from rich.table import Table

try:
    from .icd10_mapper import ICD10Mapper
    from .report_storage import ReportStorageManager
except ImportError:
    ICD10Mapper = None
    ReportStorageManager = None


class MedicalReportGenerator:
    """
    Generates professional medical reports suitable for healthcare providers.
    """
    
    def __init__(self, enable_storage: bool = True, storage_dir: str = "medical_reports"):
        """Initialize the medical report generator."""
        self.console = Console()
        self.enable_storage = enable_storage
        
        # Initialize ICD-10 mapper if available
        self.icd10_mapper = None
        if ICD10Mapper:
            try:
                self.icd10_mapper = ICD10Mapper()
            except Exception:
                pass
        
        # Initialize storage manager if enabled
        self.storage_manager = None
        if enable_storage and ReportStorageManager:
            try:
                self.storage_manager = ReportStorageManager(storage_dir)
            except Exception as e:
                print(f"Warning: Could not initialize storage manager: {e}")
                self.enable_storage = False
    
    def generate_report(self, patient_info: Dict, conversation_history: List[Dict], 
                       symptoms_text: str, auto_save: bool = True) -> Dict:
        """
        Generate a comprehensive medical report.
        
        Args:
            patient_info: Patient demographics and medical history
            conversation_history: List of conversation entries
            symptoms_text: Combined symptom text for analysis
            auto_save: Whether to automatically save the report to storage
            
        Returns:
            Dictionary containing formatted medical report with storage info
        """
        timestamp = datetime.now()
        
        report = {
            'header': self._generate_header(timestamp),
            'patient_info': self._format_patient_info(patient_info),
            'conversation_summary': self._generate_conversation_summary(conversation_history),
            'icd10_analysis': self._generate_icd10_analysis(symptoms_text, patient_info),
            'recommendations': self._generate_recommendations(conversation_history),
            'footer': self._generate_footer(),
            'metadata': {
                'generated_at': timestamp.isoformat(),
                'report_id': f"RPT-{timestamp.strftime('%Y%m%d-%H%M%S')}",
                'version': '1.0'
            }
        }
        
        # Auto-save to storage if enabled
        storage_info = {'saved': False, 'storage_id': None, 'error': None}
        if auto_save and self.enable_storage and self.storage_manager:
            try:
                # Prepare report data for storage
                report_data = {
                    'summary': self._extract_summary_for_storage(conversation_history),
                    'icd10_analysis': self._extract_icd10_for_storage(symptoms_text, patient_info),
                    'conversation_count': len(conversation_history),
                    'symptoms_text': symptoms_text,
                    'recommendations': self._extract_recommendations_for_storage(conversation_history),
                    'generated_report': self.export_report_text(report)
                }
                
                storage_id = self.storage_manager.save_report(report_data, patient_info)
                storage_info = {
                    'saved': True, 
                    'storage_id': storage_id, 
                    'error': None,
                    'message': f'Report automatically saved with ID: {storage_id}'
                }
                
                # Add storage info to report metadata
                report['metadata']['storage_id'] = storage_id
                report['metadata']['auto_saved'] = True
                
            except Exception as e:
                storage_info = {
                    'saved': False, 
                    'storage_id': None, 
                    'error': str(e),
                    'message': f'Auto-save failed: {str(e)}'
                }
        
        # Add storage info to report
        report['storage_info'] = storage_info
        
        return report
    
    def _generate_header(self, timestamp: datetime) -> str:
        """Generate report header with title and timestamp."""
        header = f"""
╔══════════════════════════════════════════════════════════════╗
║                    MEDICAL PRESCREENING REPORT                ║
║                                                              ║
║  Generated: {timestamp.strftime('%B %d, %Y at %I:%M %p')}                    ║
║  System: AI-Powered Medical Triage Assistant                ║
╚══════════════════════════════════════════════════════════════╝
"""
        return header.strip()
    
    def _format_patient_info(self, patient_info: Dict) -> str:
        """Format patient information section."""
        age = patient_info.get('age', 'Not specified')
        sex = patient_info.get('sex', 'Not specified')
        medical_history = patient_info.get('medical_history', 'None reported')
        medications = patient_info.get('medications', 'None reported')
        
        patient_section = f"""
PATIENT INFORMATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Age: {age}
Sex: {sex}
Medical History: {medical_history}
Current Medications: {medications}
"""
        return patient_section.strip()
    
    def _generate_conversation_summary(self, conversation_history: List[Dict]) -> str:
        """Generate summary of the conversation."""
        if not conversation_history:
            return "No conversation recorded."
        
        # Extract chief complaint from first query
        chief_complaint = "Not specified"
        if conversation_history:
            chief_complaint = conversation_history[0].get('query', 'Not specified')[:100]
            if len(conversation_history[0].get('query', '')) > 100:
                chief_complaint += "..."
        
        summary = f"""
CONSULTATION SUMMARY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Chief Complaint: {chief_complaint}

Symptoms Discussed: ({len(conversation_history)} interactions)"""
        
        for i, entry in enumerate(conversation_history[:5], 1):  # Show first 5 interactions
            query = entry.get('query', '').strip()
            if query:
                summary += f"\n  {i}. \"{query[:80]}{'...' if len(query) > 80 else ''}\""
        
        if len(conversation_history) > 5:
            summary += f"\n  ... and {len(conversation_history) - 5} more interactions"
        
        return summary
    
    def _generate_icd10_analysis(self, symptoms_text: str, patient_info: Dict) -> str:
        """Generate ICD-10 code analysis section."""
        if not self.icd10_mapper or not symptoms_text.strip():
            return """
ICD-10 CODE ANALYSIS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
No ICD-10 analysis available."""
        
        try:
            report = self.icd10_mapper.generate_icd10_report(symptoms_text, patient_info)
            
            if not report['has_suggestions']:
                return """
ICD-10 CODE ANALYSIS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
No specific ICD-10 codes identified from symptom presentation."""
            
            analysis = """
ICD-10 CODE ANALYSIS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"""
            
            # Primary diagnosis (highest confidence)
            primary = report['suggestions'][0]
            analysis += f"""
Primary Diagnosis:
  {primary['code']} - {primary['description']}
  Confidence: {primary['confidence_text']} ({primary['percentage']}%)"""
            
            # Secondary diagnoses
            if len(report['suggestions']) > 1:
                analysis += "\n\nSecondary Considerations:"
                for suggestion in report['suggestions'][1:3]:  # Show up to 2 secondary
                    analysis += f"""
  {suggestion['code']} - {suggestion['description']}
  Confidence: {suggestion['confidence_text']} ({suggestion['percentage']}%)"""
            
            # Clinical note
            analysis += f"""

Clinical Note: 
  {report['disclaimer'][:120]}..."""
            
            return analysis
            
        except Exception as e:
            return f"""
ICD-10 CODE ANALYSIS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Analysis unavailable due to system error."""
    
    def _generate_recommendations(self, conversation_history: List[Dict]) -> str:
        """Generate recommendations section."""
        recommendations = """
RECOMMENDATIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"""
        
        # Extract recommendations from conversation
        all_recommendations = []
        urgency_levels = []
        
        for entry in conversation_history:
            response = entry.get('response', {})
            if isinstance(response, dict):
                recs = response.get('recommendations', [])
                if recs:
                    all_recommendations.extend(recs)
                
                urgency = response.get('urgency_level', 'low')
                urgency_levels.append(urgency)
        
        # Determine overall urgency
        if 'immediate' in urgency_levels or 'urgent' in urgency_levels:
            overall_urgency = "HIGH PRIORITY"
        elif 'moderate' in urgency_levels:
            overall_urgency = "MODERATE"
        else:
            overall_urgency = "ROUTINE"
        
        recommendations += f"""
Overall Priority: {overall_urgency}

Action Items:"""
        
        if all_recommendations:
            # Remove duplicates while preserving order
            unique_recs = []
            for rec in all_recommendations:
                if rec not in unique_recs:
                    unique_recs.append(rec)
            
            for i, rec in enumerate(unique_recs[:5], 1):  # Show top 5
                recommendations += f"\n  {i}. {rec}"
        else:
            recommendations += "\n  1. Continue monitoring symptoms\n  2. Follow up if symptoms worsen"
        
        return recommendations
    
    def _generate_footer(self) -> str:
        """Generate report footer with disclaimers."""
        footer = """
IMPORTANT DISCLAIMERS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• This report is generated by an AI-powered prescreening system
• Not intended to replace professional medical diagnosis
• ICD-10 codes are preliminary suggestions requiring clinical validation
• For medical emergencies, seek immediate professional care
• Healthcare provider review and assessment recommended

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
End of Report"""
        return footer
    
    def display_report(self, report: Dict) -> None:
        """Display the formatted report using Rich console."""
        report_text = f"""
{report['header']}

{report['patient_info']}

{report['conversation_summary']}

{report['icd10_analysis']}

{report['recommendations']}

{report['footer']}
"""
        
        # Create panel for the report
        report_panel = Panel(
            report_text,
            title=f"📋 Medical Report - {report['metadata']['report_id']}",
            border_style="blue",
            padding=(1, 2)
        )
        
        self.console.print(report_panel)
    
    def export_report_text(self, report: Dict) -> str:
        """Export report as plain text string."""
        return f"""
{report['header']}

{report['patient_info']}

{report['conversation_summary']}

{report['icd10_analysis']}

{report['recommendations']}

{report['footer']}
"""

    def _extract_summary_for_storage(self, conversation_history: List[Dict]) -> str:
        """Extract concise summary for storage indexing."""
        if not conversation_history:
            return "No conversation recorded"
        
        # Get first interaction as primary summary
        first_query = conversation_history[0].get('query', 'No initial query')
        return first_query[:200] + ("..." if len(first_query) > 200 else "")
    
    def _extract_icd10_for_storage(self, symptoms_text: str, patient_info: Dict) -> Dict:
        """Extract ICD-10 data in storage-friendly format."""
        if not self.icd10_mapper or not symptoms_text.strip():
            return {'has_suggestions': False, 'suggestions': []}
        
        try:
            return self.icd10_mapper.generate_icd10_report(symptoms_text, patient_info)
        except Exception:
            return {'has_suggestions': False, 'suggestions': []}
    
    def _extract_recommendations_for_storage(self, conversation_history: List[Dict]) -> List[str]:
        """Extract recommendations for storage."""
        all_recommendations = []
        
        for entry in conversation_history:
            response = entry.get('response', {})
            if isinstance(response, dict):
                recs = response.get('recommendations', [])
                if recs:
                    all_recommendations.extend(recs)
        
        # Remove duplicates while preserving order
        unique_recs = []
        for rec in all_recommendations:
            if rec not in unique_recs:
                unique_recs.append(rec)
        
        return unique_recs[:10]  # Limit to top 10 recommendations
    
    def save_existing_report(self, report: Dict, patient_info: Dict = None) -> Dict:
        """
        Save an existing report to storage.
        
        Args:
            report: The generated report dictionary
            patient_info: Optional patient information
            
        Returns:
            Dictionary with save status information
        """
        if not self.enable_storage or not self.storage_manager:
            return {
                'saved': False,
                'error': 'Storage not enabled or available'
            }
        
        try:
            # Extract data from existing report
            report_data = {
                'summary': 'Manual save - no conversation data',
                'icd10_analysis': {'has_suggestions': False, 'suggestions': []},
                'conversation_count': 0,
                'symptoms_text': '',
                'recommendations': [],
                'generated_report': self.export_report_text(report)
            }
            
            storage_id = self.storage_manager.save_report(report_data, patient_info)
            
            return {
                'saved': True,
                'storage_id': storage_id,
                'message': f'Report saved with ID: {storage_id}'
            }
            
        except Exception as e:
            return {
                'saved': False,
                'error': str(e),
                'message': f'Save failed: {str(e)}'
            }
    
    def load_report_from_storage(self, storage_id: str) -> Optional[Dict]:
        """
        Load a report from storage.
        
        Args:
            storage_id: The storage ID to load
            
        Returns:
            Loaded report data or None if not found
        """
        if not self.enable_storage or not self.storage_manager:
            return None
        
        try:
            return self.storage_manager.load_report(storage_id)
        except Exception:
            return None
    
    def list_stored_reports(self, limit: int = 20) -> Dict:
        """
        List stored reports.
        
        Args:
            limit: Maximum number of reports to return
            
        Returns:
            Dictionary with reports list or error info
        """
        if not self.enable_storage or not self.storage_manager:
            return {'error': 'Storage not enabled or available'}
        
        try:
            return self.storage_manager.list_reports(limit=limit)
        except Exception as e:
            return {'error': str(e)}


def test_medical_report_generator():
    """Test function for the medical report generator."""
    print("🧪 Testing Medical Report Generator")
    print("=" * 50)
    
    # Create test data
    patient_info = {
        'age': '45',
        'sex': 'female',
        'medical_history': 'Hypertension, seasonal allergies',
        'medications': 'Lisinopril 10mg daily'
    }
    
    conversation_history = [
        {
            'query': 'I have been experiencing a persistent cough and runny nose for the past 3 days',
            'response': {
                'urgency_level': 'moderate',
                'recommendations': [
                    'Monitor symptoms for worsening',
                    'Stay hydrated and get rest',
                    'Consider over-the-counter decongestants'
                ]
            }
        },
        {
            'query': 'The cough seems to be getting worse, especially at night',
            'response': {
                'urgency_level': 'moderate',
                'recommendations': [
                    'Consider seeing a healthcare provider',
                    'Monitor for fever development'
                ]
            }
        }
    ]
    
    symptoms_text = "persistent cough runny nose for 3 days getting worse at night"
    
    # Generate report
    generator = MedicalReportGenerator()
    report = generator.generate_report(patient_info, conversation_history, symptoms_text)
    
    print("✅ Report generated successfully!")
    print(f"📋 Report ID: {report['metadata']['report_id']}")
    print(f"⏰ Generated at: {report['metadata']['generated_at']}")
    
    # Display the report
    print("\n" + "="*60)
    print("GENERATED REPORT PREVIEW:")
    print("="*60)
    generator.display_report(report)
    
    return True


if __name__ == "__main__":
    test_medical_report_generator()