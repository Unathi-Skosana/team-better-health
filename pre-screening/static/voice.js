class VoiceMedicalAssistant {
    constructor() {
        this.recognition = null;
        this.isRecording = false;
        
        this.initializeElements();
        this.initializeSpeechRecognition();
        this.bindEvents();
    }
    
    initializeElements() {
        this.startBtn = document.getElementById('startBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.status = document.getElementById('status');
        this.transcript = document.getElementById('transcript');
        this.transcriptSection = document.getElementById('transcript-section');
        this.resultsSection = document.getElementById('results-section');
        this.icd10Results = document.getElementById('icd10-results');
    }
    
    initializeSpeechRecognition() {
        // Check for speech recognition support
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            this.showError('Speech recognition not supported in this browser. Please use Chrome or Edge.');
            this.startBtn.disabled = true;
            return;
        }
        
        // Create recognition instance
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        // Configure recognition
        this.recognition.continuous = false;          // Stop after one result
        this.recognition.interimResults = true;       // Show interim results
        this.recognition.lang = 'en-US';             // English language
        this.recognition.maxAlternatives = 1;        // Only best result
        
        // Set up event handlers
        this.recognition.onstart = () => this.onRecognitionStart();
        this.recognition.onresult = (event) => this.onRecognitionResult(event);
        this.recognition.onerror = (event) => this.onRecognitionError(event);
        this.recognition.onend = () => this.onRecognitionEnd();
    }
    
    bindEvents() {
        this.startBtn.addEventListener('click', () => this.startRecording());
        this.stopBtn.addEventListener('click', () => this.stopRecording());
        
        // Add keyboard shortcuts
        document.addEventListener('keydown', (event) => {
            if (event.code === 'Space' && event.ctrlKey) {
                event.preventDefault();
                if (!this.isRecording) {
                    this.startRecording();
                } else {
                    this.stopRecording();
                }
            }
        });
    }
    
    startRecording() {
        if (!this.recognition) {
            this.showError('Speech recognition not available');
            return;
        }
        
        try {
            this.recognition.start();
        } catch (error) {
            this.showError('Could not start recording: ' + error.message);
        }
    }
    
    stopRecording() {
        if (this.recognition && this.isRecording) {
            this.recognition.stop();
        }
    }
    
    onRecognitionStart() {
        this.isRecording = true;
        this.startBtn.disabled = true;
        this.stopBtn.disabled = false;
        this.updateStatus('🎙️ Listening... Speak clearly!', 'recording');
        
        // Hide previous results
        this.transcriptSection.style.display = 'none';
        this.resultsSection.style.display = 'none';
    }
    
    onRecognitionResult(event) {
        let interimTranscript = '';
        let finalTranscript = '';
        
        // Process all results
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            if (result.isFinal) {
                finalTranscript += result[0].transcript;
            } else {
                interimTranscript += result[0].transcript;
            }
        }
        
        // Show interim results
        if (interimTranscript) {
            this.updateStatus(`🎙️ Hearing: "${interimTranscript}"`, 'recording');
        }
        
        // Process final results
        if (finalTranscript) {
            this.processTranscript(finalTranscript.trim());
        }
    }
    
    onRecognitionError(event) {
        let errorMessage = `Speech recognition error: ${event.error}`;
        
        // Provide helpful error messages
        switch(event.error) {
            case 'no-speech':
                errorMessage = 'No speech detected. Please try again.';
                break;
            case 'audio-capture':
                errorMessage = 'Microphone not accessible. Please check permissions.';
                break;
            case 'not-allowed':
                errorMessage = 'Microphone permission denied. Please allow microphone access.';
                break;
            case 'network':
                errorMessage = 'Network error. Please check your internet connection.';
                break;
        }
        
        this.showError(errorMessage);
        this.resetRecording();
    }
    
    onRecognitionEnd() {
        this.resetRecording();
    }
    
    resetRecording() {
        this.isRecording = false;
        this.startBtn.disabled = false;
        this.stopBtn.disabled = true;
        
        if (this.status.classList.contains('recording')) {
            this.updateStatus('Click "Start Recording" to speak your symptoms (or Ctrl+Space)', 'ready');
        }
    }
    
    async processTranscript(transcript) {
        this.showTranscript(transcript);
        this.updateStatus('🔄 Analyzing symptoms for ICD-10 codes...', 'processing');
        
        try {
            // Send to Flask API
            const response = await fetch('/api/v1/voice-analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    symptoms: transcript
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showICD10Results(data.data.icd10_results);
                
                // NEW: Show medical report if available
                if (data.data.medical_report) {
                    this.showMedicalReport(data.data.medical_report);
                }
                
                this.updateStatus(`✅ Analysis complete - Found ${data.data.analysis_count} potential codes`, 'complete');
            } else {
                this.showError(`Analysis failed: ${data.message}`);
            }
            
        } catch (error) {
            this.showError(`Network error: ${error.message}. Make sure the Flask server is running.`);
        }
    }
    
    showTranscript(transcript) {
        this.transcript.innerHTML = `"${transcript}"`;
        this.transcriptSection.style.display = 'block';
    }
    
    showICD10Results(results) {
        if (!results || results.length === 0) {
            this.icd10Results.innerHTML = `
                <div class="no-results">
                    <p>No specific medical codes identified from the symptoms described.</p>
                    <p>Please consult a healthcare provider for proper evaluation.</p>
                </div>
            `;
        } else {
            let html = '<div class="icd10-list">';
            
            results.slice(0, 3).forEach((result, index) => {
                const confidence = Math.round(result.confidence * 100);
                const confidenceClass = confidence >= 80 ? 'high' : confidence >= 60 ? 'medium' : 'low';
                
                html += `
                    <div class="icd10-item ${index === 0 ? 'primary' : ''}">
                        <div class="icd10-header">
                            <span class="code">${result.code}</span>
                            <span class="confidence ${confidenceClass}">${confidence}%</span>
                        </div>
                        <div class="description">${result.description}</div>
                        ${index === 0 ? '<div class="primary-label">Primary Match</div>' : ''}
                    </div>
                `;
            });
            
            html += '</div>';
            
            // Add interpretation note
            if (results.length > 0) {
                const primaryConfidence = Math.round(results[0].confidence * 100);
                let interpretationNote = '';
                
                if (primaryConfidence >= 80) {
                    interpretationNote = '✅ High confidence match - Consider these codes for medical documentation.';
                } else if (primaryConfidence >= 60) {
                    interpretationNote = '⚠️ Moderate confidence - Additional symptoms or examination may help clarify.';
                } else {
                    interpretationNote = '❓ Lower confidence - Symptoms may require clinical evaluation for accurate coding.';
                }
                
                html += `<div class="interpretation-note">${interpretationNote}</div>`;
            }
            
            this.icd10Results.innerHTML = html;
        }
        
        this.resultsSection.style.display = 'block';
    }
    
    showMedicalReport(report) {
        const reportSection = document.getElementById('medical-report-section');
        const reportContent = document.getElementById('medical-report-content');
        
        if (!reportSection || !reportContent || !report) return;
        
        let html = '<div class="medical-report">';
        
        // Report header
        html += `
            <div class="report-header">
                <h4>📄 Medical Assessment Report</h4>
                <p class="report-meta">Generated: ${new Date().toLocaleString()}</p>
                ${report.metadata?.report_id ? `<p class="report-id">ID: ${report.metadata.report_id}</p>` : ''}
            </div>
        `;
        
        // Patient Information (if available)
        if (report.patient_info) {
            html += `
                <div class="report-section">
                    <h5>👤 Patient Information:</h5>
                    <pre class="report-text">${report.patient_info}</pre>
                </div>
            `;
        }
        
        // ICD-10 Analysis (formatted)
        if (report.icd10_analysis) {
            html += `
                <div class="report-section">
                    <h5>🏥 ICD-10 Code Analysis:</h5>
                    <pre class="report-text">${report.icd10_analysis}</pre>
                </div>
            `;
        }
        
        // Recommendations
        if (report.recommendations) {
            html += `
                <div class="report-section">
                    <h5>💡 Clinical Recommendations:</h5>
                    <pre class="report-text">${report.recommendations}</pre>
                </div>
            `;
        }
        
        // Conversation Summary
        if (report.conversation_summary) {
            html += `
                <div class="report-section">
                    <h5>📋 Consultation Summary:</h5>
                    <pre class="report-text">${report.conversation_summary}</pre>
                </div>
            `;
        }
        
        // Disclaimer footer
        if (report.footer) {
            html += `
                <div class="report-footer">
                    <pre class="disclaimer-text">${report.footer}</pre>
                </div>
            `;
        }
        
        html += '</div>';
        reportContent.innerHTML = html;
        reportSection.style.display = 'block';
    }
    
    updateStatus(message, type = 'info') {
        this.status.innerHTML = message;
        this.status.className = `status ${type}`;
    }
    
    showError(message) {
        this.updateStatus(`❌ ${message}`, 'error');
    }
    
    // Public method for demo buttons
    processTranscriptDirectly(transcript) {
        this.processTranscript(transcript);
    }
}

// Sample processing function for demo buttons
function processSample(symptoms) {
    const assistant = window.voiceAssistant;
    if (assistant) {
        assistant.processTranscriptDirectly(symptoms);
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.voiceAssistant = new VoiceMedicalAssistant();
    
    // Show initial browser compatibility info
    console.log('🎙️ Medical Voice Assistant initialized');
    console.log('Browser support:', {
        'webkitSpeechRecognition': 'webkitSpeechRecognition' in window,
        'SpeechRecognition': 'SpeechRecognition' in window
    });
});