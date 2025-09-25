#!/usr/bin/env python3
"""
Medical Report API - Flask REST API for Medical Report Storage System

This Flask application provides REST endpoints for the medical report storage system,
enabling programmatic access to medical reports through standard HTTP methods.

Features:
- RESTful API endpoints for CRUD operations
- Search and filtering capabilities
- Statistics and health monitoring
- CORS support for web applications
- JSON request/response format
- Error handling with appropriate HTTP status codes

Usage:
    python app.py                    # Run development server
    flask run --host=0.0.0.0        # Run with custom host
    FLASK_ENV=production python app.py  # Run in production mode

API Endpoints:
    GET    /api/v1/reports           # List all reports
    POST   /api/v1/reports           # Create new report
    GET    /api/v1/reports/{id}      # Get specific report
    DELETE /api/v1/reports/{id}      # Delete specific report
    GET    /api/v1/search            # Search reports
    GET    /api/v1/statistics        # Get system statistics
    GET    /api/v1/health           # Health check

Author: Medical AI Development Team
Date: September 24, 2025
Version: 1.0
"""

import os
import sys
from datetime import datetime
from typing import Dict, Any, List, Optional, Tuple

# Add src directory to path for imports
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from werkzeug.exceptions import BadRequest, NotFound, InternalServerError
import json
import traceback

# Import our storage system
from report_storage import ReportStorageManager
from medical_report import MedicalReportGenerator

# Initialize Flask app
app = Flask(__name__)

# Enable CORS for all routes (allows web applications to access the API)
CORS(app, origins="*", methods=["GET", "POST", "DELETE", "OPTIONS"])

# Global storage manager instance
storage_manager = ReportStorageManager()

# API Configuration
API_VERSION = "v1"
API_BASE = f"/api/{API_VERSION}"


def create_error_response(message: str, status_code: int = 400, details: Optional[Dict] = None) -> Tuple[Dict, int]:
    """
    Create standardized error response format.
    
    Args:
        message: Error message for the user
        status_code: HTTP status code
        details: Optional additional error details
    
    Returns:
        Tuple of (error_dict, status_code)
    """
    error_response = {
        "error": True,
        "message": message,
        "timestamp": datetime.now().isoformat(),
        "status_code": status_code
    }
    
    if details:
        error_response["details"] = details
    
    return error_response, status_code


def create_success_response(data: Any = None, message: str = "Success") -> Dict:
    """
    Create standardized success response format.
    
    Args:
        data: Response data
        message: Success message
    
    Returns:
        Success response dictionary
    """
    response = {
        "success": True,
        "message": message,
        "timestamp": datetime.now().isoformat()
    }
    
    if data is not None:
        response["data"] = data
    
    return response


def validate_search_params(args: Dict) -> Dict:
    """
    Validate and process search parameters from request.
    
    Args:
        args: Request arguments dictionary
    
    Returns:
        Processed search parameters
    
    Raises:
        BadRequest: If parameters are invalid
    """
    search_params = {}
    
    # Text search parameters
    if "patient_name" in args:
        search_params["patient_name"] = args["patient_name"].strip()
    
    if "patient_id" in args:
        search_params["patient_id"] = args["patient_id"].strip()
    
    if "keywords" in args:
        search_params["keywords"] = args["keywords"].strip()
    
    # ICD-10 codes (can be comma-separated)
    if "icd10_codes" in args:
        icd10_codes = [code.strip() for code in args["icd10_codes"].split(",") if code.strip()]
        if icd10_codes:
            search_params["icd10_codes"] = icd10_codes
    
    # Date range parameters
    if "start_date" in args:
        try:
            start_date = datetime.fromisoformat(args["start_date"])
            search_params["start_date"] = start_date
        except ValueError:
            raise BadRequest("Invalid start_date format. Use ISO format (YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS)")
    
    if "end_date" in args:
        try:
            end_date = datetime.fromisoformat(args["end_date"])
            search_params["end_date"] = end_date
        except ValueError:
            raise BadRequest("Invalid end_date format. Use ISO format (YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS)")
    
    # Pagination parameters
    if "limit" in args:
        try:
            limit = int(args["limit"])
            if limit <= 0 or limit > 1000:
                raise BadRequest("Limit must be between 1 and 1000")
            search_params["limit"] = limit
        except ValueError:
            raise BadRequest("Limit must be a valid integer")
    
    if "offset" in args:
        try:
            offset = int(args["offset"])
            if offset < 0:
                raise BadRequest("Offset must be non-negative")
            search_params["offset"] = offset
        except ValueError:
            raise BadRequest("Offset must be a valid integer")
    
    return search_params


# =============================================================================
# API ENDPOINTS
# =============================================================================

@app.route(f"{API_BASE}/health", methods=["GET"])
def health_check() -> Response:
    """
    Health check endpoint for API monitoring.
    
    Returns:
        JSON response with API health status and system information
    
    Example:
        GET /api/v1/health
        
        Response:
        {
            "success": true,
            "message": "API is healthy",
            "timestamp": "2025-09-24T10:30:00",
            "data": {
                "api_version": "v1",
                "storage_healthy": true,
                "total_reports": 7,
                "storage_size_mb": 0.03
            }
        }
    """
    try:
        # Check storage system health
        stats = storage_manager.get_storage_stats()
        
        health_data = {
            "api_version": API_VERSION,
            "storage_healthy": True,
            "total_reports": stats["total_reports"],
            "storage_size_mb": stats["total_size_mb"]
        }
        
        return jsonify(create_success_response(health_data, "API is healthy"))
    
    except Exception as e:
        app.logger.error(f"Health check failed: {str(e)}")
        error_data = {"storage_healthy": False, "error": str(e)}
        return jsonify(create_error_response("Health check failed", 500, error_data))


@app.route(f"{API_BASE}/statistics", methods=["GET"])
def get_statistics() -> Response:
    """
    Get comprehensive system statistics.
    
    Returns:
        JSON response with detailed storage statistics
    
    Example:
        GET /api/v1/statistics
        
        Response:
        {
            "success": true,
            "message": "Statistics retrieved successfully",
            "timestamp": "2025-09-24T10:30:00",
            "data": {
                "total_reports": 7,
                "storage_size_mb": 0.03,
                "reports_by_year": {"2025": 7},
                "most_common_icd10": [["R50.9", 3], ["I10", 2]],
                "recent_reports": 5
            }
        }
    """
    try:
        stats = storage_manager.get_storage_stats()
        return jsonify(create_success_response(stats, "Statistics retrieved successfully"))
    
    except Exception as e:
        app.logger.error(f"Failed to get statistics: {str(e)}")
        return jsonify(create_error_response("Failed to retrieve statistics", 500, {"error": str(e)}))


@app.route(f"{API_BASE}/reports", methods=["GET"])
def list_reports() -> Response:
    """
    List reports with optional pagination.
    
    Query Parameters:
        limit (int): Maximum number of reports to return (1-1000, default: 50)
        offset (int): Number of reports to skip (default: 0)
    
    Returns:
        JSON response with list of reports
    
    Example:
        GET /api/v1/reports?limit=20&offset=0
        
        Response:
        {
            "success": true,
            "message": "Reports retrieved successfully",
            "timestamp": "2025-09-24T10:30:00",
            "data": {
                "reports": [...],
                "pagination": {
                    "limit": 20,
                    "offset": 0,
                    "total": 7,
                    "has_more": false
                }
            }
        }
    """
    try:
        # Get pagination parameters
        limit = request.args.get("limit", 50, type=int)
        offset = request.args.get("offset", 0, type=int)
        
        # Validate parameters
        if limit <= 0 or limit > 1000:
            return jsonify(create_error_response("Limit must be between 1 and 1000", 400))
        
        if offset < 0:
            return jsonify(create_error_response("Offset must be non-negative", 400))
        
        # Get reports
        reports = storage_manager.list_reports(limit=limit + 1, offset=offset)  # Get one extra to check for more
        
        # Determine if there are more reports
        has_more = len(reports) > limit
        if has_more:
            reports = reports[:limit]  # Remove the extra report
        
        # Create pagination info
        pagination = {
            "limit": limit,
            "offset": offset,
            "returned": len(reports),
            "has_more": has_more
        }
        
        # Get total count for additional context
        try:
            stats = storage_manager.get_storage_stats()
            pagination["total"] = stats["total_reports"]
        except:
            pass  # Don't fail if we can't get total
        
        response_data = {
            "reports": reports,
            "pagination": pagination
        }
        
        return jsonify(create_success_response(response_data, f"Retrieved {len(reports)} reports"))
    
    except Exception as e:
        app.logger.error(f"Failed to list reports: {str(e)}")
        return jsonify(create_error_response("Failed to retrieve reports", 500, {"error": str(e)}))


@app.route(f"{API_BASE}/reports/<report_id>", methods=["GET"])
def get_report(report_id: str) -> Response:
    """
    Get a specific report by ID.
    
    Args:
        report_id: Report ID to retrieve
    
    Returns:
        JSON response with report data
    
    Example:
        GET /api/v1/reports/2a7f6b70
        
        Response:
        {
            "success": true,
            "message": "Report retrieved successfully",
            "timestamp": "2025-09-24T10:30:00",
            "data": {
                "report_id": "2a7f6b70",
                "patient_id": "P001",
                "timestamp": "2025-09-24T10:25:33.123456",
                ...
            }
        }
    """
    try:
        # Validate report ID format
        if not report_id or len(report_id) != 8:
            return jsonify(create_error_response("Invalid report ID format", 400))
        
        # Load report
        report = storage_manager.load_report(report_id)
        
        if not report:
            return jsonify(create_error_response(f"Report {report_id} not found", 404))
        
        return jsonify(create_success_response(report, "Report retrieved successfully"))
    
    except Exception as e:
        app.logger.error(f"Failed to get report {report_id}: {str(e)}")
        return jsonify(create_error_response("Failed to retrieve report", 500, {"error": str(e)}))


@app.route(f"{API_BASE}/reports", methods=["POST"])
def create_report() -> Response:
    """
    Create a new medical report.
    
    Request Body:
        JSON object with patient symptoms and optional parameters
        {
            "patient_id": "P123",
            "patient_name": "John Doe",
            "symptoms": "chest pain, shortness of breath",
            "patient_age": 45,
            "patient_gender": "male",
            "auto_save": true
        }
    
    Returns:
        JSON response with created report data
    
    Example:
        POST /api/v1/reports
        Content-Type: application/json
        
        {
            "patient_id": "API001",
            "patient_name": "Jane Smith",
            "symptoms": "headache, fever, nausea"
        }
        
        Response:
        {
            "success": true,
            "message": "Report created successfully",
            "timestamp": "2025-09-24T10:30:00",
            "data": {
                "report_id": "a1b2c3d4",
                "patient_id": "API001",
                "created": true,
                ...
            }
        }
    """
    try:
        # Validate request
        if not request.is_json:
            return jsonify(create_error_response("Request must be JSON", 400))
        
        data = request.get_json()
        
        # Validate required fields
        required_fields = ["symptoms"]
        for field in required_fields:
            if field not in data or not data[field].strip():
                return jsonify(create_error_response(f"Missing required field: {field}", 400))
        
        # Extract parameters
        symptoms = data["symptoms"].strip()
        patient_id = data.get("patient_id", "").strip()
        patient_name = data.get("patient_name", "").strip()
        patient_age = data.get("patient_age")
        patient_gender = data.get("patient_gender", "").strip()
        auto_save = data.get("auto_save", True)
        
        # Validate age if provided
        if patient_age is not None:
            try:
                patient_age = int(patient_age)
                if patient_age < 0 or patient_age > 150:
                    return jsonify(create_error_response("Patient age must be between 0 and 150", 400))
            except (ValueError, TypeError):
                return jsonify(create_error_response("Patient age must be a valid integer", 400))
        
        # Generate report
        generator = MedicalReportGenerator(enable_storage=auto_save)
        
        # Set patient information if provided
        if patient_id:
            generator.patient_id = patient_id
        if patient_name:
            generator.patient_name = patient_name
        if patient_age is not None:
            generator.patient_age = patient_age
        if patient_gender:
            generator.patient_gender = patient_gender
        
        # Generate the report
        report = generator.generate_report(symptoms, auto_save=auto_save)
        
        return jsonify(create_success_response(report, "Report created successfully")), 201
    
    except Exception as e:
        app.logger.error(f"Failed to create report: {str(e)}")
        traceback.print_exc()
        return jsonify(create_error_response("Failed to create report", 500, {"error": str(e)}))


@app.route(f"{API_BASE}/reports/<report_id>", methods=["DELETE"])
def delete_report(report_id: str) -> Response:
    """
    Delete a specific report by ID.
    
    Args:
        report_id: Report ID to delete
    
    Returns:
        JSON response confirming deletion
    
    Example:
        DELETE /api/v1/reports/2a7f6b70
        
        Response:
        {
            "success": true,
            "message": "Report deleted successfully",
            "timestamp": "2025-09-24T10:30:00",
            "data": {
                "deleted_report_id": "2a7f6b70",
                "deleted": true
            }
        }
    """
    try:
        # Validate report ID format
        if not report_id or len(report_id) != 8:
            return jsonify(create_error_response("Invalid report ID format", 400))
        
        # Check if report exists
        existing_report = storage_manager.load_report(report_id)
        if not existing_report:
            return jsonify(create_error_response(f"Report {report_id} not found", 404))
        
        # Delete report
        success = storage_manager.delete_report(report_id)
        
        if success:
            response_data = {
                "deleted_report_id": report_id,
                "deleted": True
            }
            return jsonify(create_success_response(response_data, "Report deleted successfully"))
        else:
            return jsonify(create_error_response("Failed to delete report", 500))
    
    except Exception as e:
        app.logger.error(f"Failed to delete report {report_id}: {str(e)}")
        return jsonify(create_error_response("Failed to delete report", 500, {"error": str(e)}))


@app.route(f"{API_BASE}/search", methods=["GET"])
def search_reports() -> Response:
    """
    Search reports with various filter options.
    
    Query Parameters:
        patient_name (str): Filter by patient name (partial match)
        patient_id (str): Filter by patient ID (exact match)
        icd10_codes (str): Filter by ICD-10 codes (comma-separated)
        keywords (str): Search report text for keywords
        start_date (str): Filter by minimum date (ISO format)
        end_date (str): Filter by maximum date (ISO format)
        limit (int): Maximum results to return (1-1000, default: 50)
        offset (int): Number of results to skip (default: 0)
    
    Returns:
        JSON response with matching reports
    
    Example:
        GET /api/v1/search?patient_name=John&icd10_codes=R50.9,I10&limit=10
        
        Response:
        {
            "success": true,
            "message": "Found 3 matching reports",
            "timestamp": "2025-09-24T10:30:00",
            "data": {
                "reports": [...],
                "search_params": {...},
                "pagination": {...}
            }
        }
    """
    try:
        # Validate and process search parameters
        search_params = validate_search_params(request.args.to_dict())
        
        # Set default pagination if not provided
        if "limit" not in search_params:
            search_params["limit"] = 50
        if "offset" not in search_params:
            search_params["offset"] = 0
        
        # Perform search
        results = storage_manager.search_reports(**search_params)
        
        # Create response
        response_data = {
            "reports": results,
            "search_params": {k: v.isoformat() if isinstance(v, datetime) else v for k, v in search_params.items()},
            "pagination": {
                "limit": search_params["limit"],
                "offset": search_params["offset"],
                "returned": len(results)
            }
        }
        
        message = f"Found {len(results)} matching report{'s' if len(results) != 1 else ''}"
        return jsonify(create_success_response(response_data, message))
    
    except BadRequest as e:
        return jsonify(create_error_response(str(e), 400))
    except Exception as e:
        app.logger.error(f"Search failed: {str(e)}")
        return jsonify(create_error_response("Search failed", 500, {"error": str(e)}))


@app.route(f"{API_BASE}/reports/patient/<patient_id>", methods=["GET"])
def get_reports_by_patient(patient_id: str) -> Response:
    """
    Get all reports for a specific patient.
    
    Args:
        patient_id: Patient ID to search for
    
    Query Parameters:
        limit (int): Maximum results to return (default: 100)
    
    Returns:
        JSON response with patient's reports
    
    Example:
        GET /api/v1/reports/patient/P001?limit=20
        
        Response:
        {
            "success": true,
            "message": "Found 2 reports for patient P001",
            "timestamp": "2025-09-24T10:30:00",
            "data": {
                "patient_id": "P001",
                "reports": [...],
                "count": 2
            }
        }
    """
    try:
        if not patient_id.strip():
            return jsonify(create_error_response("Patient ID cannot be empty", 400))
        
        limit = request.args.get("limit", 100, type=int)
        if limit <= 0 or limit > 1000:
            return jsonify(create_error_response("Limit must be between 1 and 1000", 400))
        
        # Search for reports by patient ID
        reports = storage_manager.search_reports(patient_id=patient_id.strip(), limit=limit)
        
        response_data = {
            "patient_id": patient_id,
            "reports": reports,
            "count": len(reports)
        }
        
        message = f"Found {len(reports)} report{'s' if len(reports) != 1 else ''} for patient {patient_id}"
        return jsonify(create_success_response(response_data, message))
    
    except Exception as e:
        app.logger.error(f"Failed to get reports for patient {patient_id}: {str(e)}")
        return jsonify(create_error_response("Failed to retrieve patient reports", 500, {"error": str(e)}))


# =============================================================================
# ERROR HANDLERS
# =============================================================================

@app.errorhandler(400)
def bad_request(error):
    """Handle 400 Bad Request errors."""
    return jsonify(create_error_response("Bad request", 400, {"description": str(error)})), 400


@app.errorhandler(404)
def not_found(error):
    """Handle 404 Not Found errors."""
    return jsonify(create_error_response("Resource not found", 404, {"description": str(error)})), 404


@app.errorhandler(405)
def method_not_allowed(error):
    """Handle 405 Method Not Allowed errors."""
    return jsonify(create_error_response("Method not allowed", 405, {"description": str(error)})), 405


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 Internal Server Error."""
    app.logger.error(f"Internal server error: {str(error)}")
    return jsonify(create_error_response("Internal server error", 500, {"description": "An unexpected error occurred"})), 500


# =============================================================================
# MAIN APPLICATION
# =============================================================================

if __name__ == "__main__":
    # Configuration
    debug_mode = os.environ.get("FLASK_ENV") != "production"
    port = int(os.environ.get("PORT", 5000))
    host = os.environ.get("HOST", "127.0.0.1")
    
    print(f"""
🏥 Medical Report API Starting...
    
📊 API Information:
   • Version: {API_VERSION}
   • Base URL: http://{host}:{port}{API_BASE}
   • Debug Mode: {debug_mode}
   • CORS: Enabled for all origins
   
🔗 Available Endpoints:
   • GET    {API_BASE}/health           - Health check
   • GET    {API_BASE}/statistics       - System statistics
   • GET    {API_BASE}/reports          - List reports (with pagination)
   • POST   {API_BASE}/reports          - Create new report
   • GET    {API_BASE}/reports/<id>     - Get specific report
   • DELETE {API_BASE}/reports/<id>     - Delete specific report
   • GET    {API_BASE}/search           - Search reports
   • GET    {API_BASE}/reports/patient/<id> - Get patient's reports
   
📚 Documentation:
   • API Documentation: docs/REST_API_DOCUMENTATION.md
   • Quick Start Guide: docs/QUICK_START_GUIDE.md
   • Storage Documentation: docs/REPORT_STORAGE_DOCUMENTATION.md
   
🚀 Starting server at http://{host}:{port}
    """)
    
    app.run(host=host, port=port, debug=debug_mode)