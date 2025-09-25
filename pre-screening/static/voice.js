class VoiceMedicalAssistant {
    constructor() {
        this.recognition = null;
        this.isRecording = false;
        this.currentTranscript = '';  // Accumulate transcript during recording
        
        this.initializeElements();
        this.setupSpeechRecognition();
        this.bindEvents();
    }
    
    initializeElements() {
        this.startBtn = document.getElementById('startBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.aiAnalyzeBtn = document.getElementById('aiAnalyzeBtn');
        this.status = document.getElementById('status');
        this.transcript = document.getElementById('transcript');
        this.transcriptSection = document.getElementById('transcript-section');
        this.resultsSection = document.getElementById('results-section');
        this.icd10Results = document.getElementById('icd10-results');
        
        // Debug logging
        console.log('Elements initialized:', {
            startBtn: !!this.startBtn,
            stopBtn: !!this.stopBtn,
            aiAnalyzeBtn: !!this.aiAnalyzeBtn
        });
    }
    
    setupSpeechRecognition() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            this.showError('Speech recognition not supported in this browser. Please use Chrome or Edge.');
            return false;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        // Extended recording settings for longer sessions
        this.recognition.continuous = true;           // Keep recording through pauses
        this.recognition.interimResults = true;       // Show results as you speak
        this.recognition.maxAlternatives = 1;         // One result option
        this.recognition.lang = 'en-US';              // English language
        
        // Bind event handlers with proper context
        this.recognition.onstart = () => this.onRecognitionStart();
        this.recognition.onresult = (event) => this.onRecognitionResult(event);
        this.recognition.onerror = (event) => this.onRecognitionError(event);
        this.recognition.onend = () => this.onRecognitionEnd();
        
        return true;
    }
    
    bindEvents() {
        this.startBtn.addEventListener('click', () => this.startRecording());
        this.stopBtn.addEventListener('click', () => this.stopRecording());
        
        // AI analysis button
        if (this.aiAnalyzeBtn) {
            this.aiAnalyzeBtn.addEventListener('click', () => this.analyzeWithAI());
        }
        
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
        console.log('Start recording called');
        if (!this.recognition) {
            this.showError('Speech recognition not available');
            return;
        }
        
        // Reset for new recording session
        this.currentTranscript = '';
        this.aiAnalyzeBtn.disabled = true;
        
        try {
            this.recognition.start();
        } catch (error) {
            this.showError('Could not start recording: ' + error.message);
        }
    }
    
    stopRecording() {
        if (this.recognition && this.isRecording) {
            this.isRecording = false;  // Set flag first to prevent restart
            this.recognition.stop();
        }
    }
    
    onRecognitionStart() {
        this.isRecording = true;
        this.startBtn.disabled = true;
        this.stopBtn.disabled = false;
        this.updateStatus('🎙️ Listening continuously... Speak your symptoms clearly!', 'recording');
        
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
        
        // Show interim results while recording
        if (interimTranscript) {
            this.updateStatus(`🎙️ Hearing: "${interimTranscript}"`, 'recording');
        }
        
        // Store final results but don't process until user stops manually
        if (finalTranscript) {
            this.currentTranscript = (this.currentTranscript || '') + ' ' + finalTranscript.trim();
            this.updateStatus(`🎙️ Captured: "${this.currentTranscript.trim()}" - Keep speaking or click Stop`, 'recording');
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
        this.isRecording = false;
        this.startBtn.disabled = false;
        this.stopBtn.disabled = true;
        
        // Process accumulated transcript if we have any
        if (this.currentTranscript && this.currentTranscript.trim()) {
            this.processTranscript(this.currentTranscript.trim());
            // Enable AI button for further analysis
            this.aiAnalyzeBtn.disabled = false;
        } else {
            this.updateStatus('Click "Start Recording" to speak your symptoms', 'ready');
        }
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
                
                // Enable AI analysis button
                this.aiAnalyzeBtn.disabled = false;
                
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
    
    // AI Analysis Methods
    analyzeWithAI() {
        const lastTranscript = this.transcript.textContent;
        if (lastTranscript && lastTranscript !== '""' && lastTranscript.trim()) {
            const cleanTranscript = lastTranscript.replace(/^"|"$/g, '').trim();
            if (cleanTranscript) {
                this.processWithGoogleAI(cleanTranscript);
            } else {
                this.showError('No valid transcript available. Please record your symptoms first.');
            }
        } else {
            this.showError('No transcript available. Please record your symptoms first or use sample buttons.');
        }
    }
    
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
                this.updateStatus(`✅ AI Analysis complete - Found ${data.data.icd10_analysis.count} codes + AI insights`, 'complete');
            } else {
                this.showError(`AI Analysis failed: ${data.message}`);
            }
            
        } catch (error) {
            this.showError(`AI Network error: ${error.message}. Make sure the Flask server is running.`);
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
                    <h4>${section.replace(/\*\*/g, '').replace(/_/g, ' ').toUpperCase()}</h4>
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
            this.resultsSection.after(aiSection);
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
            const aiSection = document.getElementById('ai-insights-section');
            if (aiSection) {
                aiSection.after(questionsSection);
            } else {
                this.resultsSection.after(questionsSection);
            }
        }
        
        document.getElementById('follow-up-questions').innerHTML = html;
        questionsSection.style.display = 'block';
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