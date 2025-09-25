"""
Medical Report Storage Manager
Simple JSON-based storage system for medical reports
"""

import json
import os
import uuid
from datetime import datetime
from typing import Dict, List, Optional, Any
import glob
import logging


class ReportStorageManager:
    """
    Simple JSON file-based storage system for medical reports.
    Designed for basic hackathon use with minimal security requirements.
    """
    
    def __init__(self, storage_dir: str = "medical_reports"):
        """
        Initialize the storage manager.
        
        Args:
            storage_dir: Base directory for storing medical reports
        """
        self.storage_dir = os.path.abspath(storage_dir)
        self.index_file = os.path.join(self.storage_dir, "reports_index.json")
        self.logger = logging.getLogger(__name__)
        
        # Ensure storage directory exists
        os.makedirs(self.storage_dir, exist_ok=True)
        
        # Initialize index if it doesn't exist
        self._initialize_index()
    
    def _initialize_index(self):
        """Initialize the reports index file if it doesn't exist."""
        if not os.path.exists(self.index_file):
            initial_index = {
                "created_at": datetime.now().isoformat(),
                "total_reports": 0,
                "reports": []
            }
            with open(self.index_file, 'w', encoding='utf-8') as f:
                json.dump(initial_index, f, indent=2, ensure_ascii=False)
            self.logger.info(f"Created new reports index at {self.index_file}")
    
    def _load_index(self) -> Dict[str, Any]:
        """Load the reports index."""
        try:
            with open(self.index_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError) as e:
            self.logger.error(f"Error loading index: {e}")
            # Return empty index structure
            return {"created_at": datetime.now().isoformat(), "total_reports": 0, "reports": []}
    
    def _save_index(self, index_data: Dict[str, Any]):
        """Save the reports index."""
        try:
            with open(self.index_file, 'w', encoding='utf-8') as f:
                json.dump(index_data, f, indent=2, ensure_ascii=False)
        except Exception as e:
            self.logger.error(f"Error saving index: {e}")
            raise
    
    def _generate_report_id(self) -> str:
        """Generate a unique report ID."""
        return str(uuid.uuid4())[:8]  # Short UUID for simplicity
    
    def _get_year_directory(self, timestamp: datetime) -> str:
        """Get or create year directory for storing reports."""
        year_dir = os.path.join(self.storage_dir, str(timestamp.year))
        os.makedirs(year_dir, exist_ok=True)
        return year_dir
    
    def _generate_filename(self, report_id: str, timestamp: datetime) -> str:
        """Generate filename for a report."""
        time_str = timestamp.strftime("%Y%m%d_%H%M%S")
        return f"report_{time_str}_{report_id}.json"
    
    def save_report(self, report_data: Dict[str, Any], patient_info: Dict[str, Any] = None) -> str:
        """
        Save a medical report to JSON storage.
        
        Args:
            report_data: The medical report data
            patient_info: Optional patient information
            
        Returns:
            The report ID for future reference
        """
        # Generate unique ID and timestamp
        report_id = self._generate_report_id()
        timestamp = datetime.now()
        
        # Prepare report structure
        stored_report = {
            "id": report_id,
            "created_at": timestamp.isoformat(),
            "timestamp": timestamp.strftime("%Y-%m-%d %H:%M:%S"),
            "patient_info": patient_info or {},
            "report_data": report_data,
            "metadata": {
                "version": "1.0",
                "created_by": "Medical AI Prescreening System",
                "file_type": "medical_report"
            }
        }
        
        # Determine file location
        year_dir = self._get_year_directory(timestamp)
        filename = self._generate_filename(report_id, timestamp)
        filepath = os.path.join(year_dir, filename)
        
        try:
            # Save the report file
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(stored_report, f, indent=2, ensure_ascii=False)
            
            # Update index
            index_data = self._load_index()
            index_entry = {
                "id": report_id,
                "created_at": timestamp.isoformat(),
                "filename": filename,
                "filepath": filepath,
                "patient_name": patient_info.get("name", "Unknown") if patient_info else "Unknown",
                "patient_id": patient_info.get("id", "N/A") if patient_info else "N/A",
                "has_icd10": "icd10_analysis" in report_data,
                "icd10_codes": self._extract_icd10_codes(report_data),
                "summary": report_data.get("summary", "No summary available")[:100] + "..." if len(report_data.get("summary", "")) > 100 else report_data.get("summary", "")
            }
            
            index_data["reports"].append(index_entry)
            index_data["total_reports"] += 1
            index_data["last_updated"] = timestamp.isoformat()
            
            self._save_index(index_data)
            
            self.logger.info(f"Successfully saved report {report_id} to {filepath}")
            return report_id
            
        except Exception as e:
            self.logger.error(f"Error saving report: {e}")
            raise Exception(f"Failed to save report: {str(e)}")
    
    def _extract_icd10_codes(self, report_data: Dict[str, Any]) -> List[str]:
        """Extract ICD-10 codes from report data for indexing."""
        codes = []
        
        # Look for ICD-10 data in various possible locations
        if "icd10_analysis" in report_data:
            icd10_data = report_data["icd10_analysis"]
            if "suggestions" in icd10_data:
                for suggestion in icd10_data["suggestions"]:
                    if "code" in suggestion:
                        codes.append(suggestion["code"])
        
        # Also check for direct ICD-10 codes
        if "icd10_codes" in report_data:
            if isinstance(report_data["icd10_codes"], list):
                codes.extend(report_data["icd10_codes"])
        
        return list(set(codes))  # Remove duplicates
    
    def load_report(self, report_id: str) -> Optional[Dict[str, Any]]:
        """
        Load a specific report by ID.
        
        Args:
            report_id: The report ID to load
            
        Returns:
            Report data or None if not found
        """
        # Find report in index
        index_data = self._load_index()
        
        for report in index_data["reports"]:
            if report["id"] == report_id:
                filepath = report["filepath"]
                
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        return json.load(f)
                except (FileNotFoundError, json.JSONDecodeError) as e:
                    self.logger.error(f"Error loading report {report_id}: {e}")
                    return None
        
        self.logger.warning(f"Report {report_id} not found in index")
        return None
    
    def list_reports(self, limit: int = 50, offset: int = 0) -> Dict[str, Any]:
        """
        List all reports with pagination.
        
        Args:
            limit: Maximum number of reports to return
            offset: Number of reports to skip
            
        Returns:
            Dictionary with reports list and metadata
        """
        index_data = self._load_index()
        reports = index_data["reports"]
        
        # Sort by creation date (newest first)
        reports.sort(key=lambda x: x["created_at"], reverse=True)
        
        # Apply pagination
        paginated_reports = reports[offset:offset + limit]
        
        return {
            "reports": paginated_reports,
            "total": len(reports),
            "limit": limit,
            "offset": offset,
            "has_more": offset + limit < len(reports)
        }
    
    def search_reports(self, 
                      patient_name: str = None,
                      patient_id: str = None,
                      icd10_code: str = None,
                      date_from: str = None,
                      date_to: str = None,
                      keyword: str = None,
                      limit: int = 50) -> List[Dict[str, Any]]:
        """
        Search reports with basic filtering.
        
        Args:
            patient_name: Filter by patient name (partial match)
            patient_id: Filter by exact patient ID
            icd10_code: Filter by ICD-10 code
            date_from: Filter from date (YYYY-MM-DD format)
            date_to: Filter to date (YYYY-MM-DD format)
            keyword: Search in summary/content
            limit: Maximum results to return
            
        Returns:
            List of matching reports
        """
        index_data = self._load_index()
        reports = index_data["reports"]
        filtered_reports = []
        
        for report in reports:
            # Apply filters
            if patient_name and patient_name.lower() not in report["patient_name"].lower():
                continue
            
            if patient_id and patient_id != report["patient_id"]:
                continue
            
            if icd10_code and icd10_code not in report["icd10_codes"]:
                continue
            
            if date_from:
                report_date = report["created_at"][:10]  # Extract YYYY-MM-DD
                if report_date < date_from:
                    continue
            
            if date_to:
                report_date = report["created_at"][:10]
                if report_date > date_to:
                    continue
            
            if keyword and keyword.lower() not in report["summary"].lower():
                continue
            
            filtered_reports.append(report)
        
        # Sort by creation date (newest first) and limit
        filtered_reports.sort(key=lambda x: x["created_at"], reverse=True)
        return filtered_reports[:limit]
    
    def delete_report(self, report_id: str) -> bool:
        """
        Delete a report and remove from index.
        
        Args:
            report_id: The report ID to delete
            
        Returns:
            True if successful, False if report not found
        """
        index_data = self._load_index()
        
        # Find and remove from index
        for i, report in enumerate(index_data["reports"]):
            if report["id"] == report_id:
                filepath = report["filepath"]
                
                try:
                    # Delete file
                    if os.path.exists(filepath):
                        os.remove(filepath)
                    
                    # Remove from index
                    index_data["reports"].pop(i)
                    index_data["total_reports"] -= 1
                    index_data["last_updated"] = datetime.now().isoformat()
                    
                    self._save_index(index_data)
                    
                    self.logger.info(f"Successfully deleted report {report_id}")
                    return True
                    
                except Exception as e:
                    self.logger.error(f"Error deleting report {report_id}: {e}")
                    return False
        
        self.logger.warning(f"Report {report_id} not found for deletion")
        return False
    
    def get_storage_stats(self) -> Dict[str, Any]:
        """
        Get storage statistics.
        
        Returns:
            Dictionary with storage statistics
        """
        index_data = self._load_index()
        
        # Calculate file sizes
        total_size = 0
        for report in index_data["reports"]:
            if os.path.exists(report["filepath"]):
                total_size += os.path.getsize(report["filepath"])
        
        # Count by year
        year_counts = {}
        for report in index_data["reports"]:
            year = report["created_at"][:4]
            year_counts[year] = year_counts.get(year, 0) + 1
        
        return {
            "total_reports": index_data["total_reports"],
            "total_size_bytes": total_size,
            "total_size_mb": round(total_size / (1024 * 1024), 2),
            "storage_directory": self.storage_dir,
            "reports_by_year": year_counts,
            "index_created": index_data.get("created_at"),
            "last_updated": index_data.get("last_updated")
        }


def demo_storage_system():
    """Demo function to test the storage system."""
    storage = ReportStorageManager()
    
    # Sample report data
    sample_report = {
        "summary": "Patient presents with respiratory symptoms including persistent cough and mild fever.",
        "icd10_analysis": {
            "has_suggestions": True,
            "suggestions": [
                {"code": "R05", "description": "Cough", "confidence": 0.9},
                {"code": "R50.9", "description": "Fever, unspecified", "confidence": 0.8}
            ]
        },
        "assessment": "Likely upper respiratory infection",
        "recommendations": "Rest, fluids, monitor symptoms"
    }
    
    sample_patient = {
        "id": "P001",
        "name": "John Doe",
        "age": 35,
        "gender": "Male"
    }
    
    print("🗂️ Testing Medical Report Storage")
    print("=" * 50)
    
    # Save a report
    try:
        report_id = storage.save_report(sample_report, sample_patient)
        print(f"✅ Saved report with ID: {report_id}")
        
        # Load the report back
        loaded_report = storage.load_report(report_id)
        if loaded_report:
            print(f"✅ Successfully loaded report {report_id}")
        
        # List reports
        reports_list = storage.list_reports(limit=10)
        print(f"📋 Found {reports_list['total']} total reports")
        
        # Get stats
        stats = storage.get_storage_stats()
        print(f"📊 Storage stats: {stats['total_reports']} reports, {stats['total_size_mb']} MB")
        
    except Exception as e:
        print(f"❌ Error: {e}")


if __name__ == "__main__":
    demo_storage_system()