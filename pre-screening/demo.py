#!/usr/bin/env python3
"""
Demo script for MedGemma Medical Prescreening System
Hackathon prototype showcasing AI-powered medical triage and assessment.
"""

import sys
import os
from pathlib import Path

# Add src directory to Python path
sys.path.append(str(Path(__file__).parent / "src"))

from src.medical_assistant import MedicalAssistant
from src.fallback_assistant import FallbackMedicalAssistant
from src.chat_interface import ChatInterface
from src.prescreening import PrescreeningEngine
import json
import time


def demo_basic_functionality():
    """Demonstrate basic functionality with sample queries."""
    print("🧪 Testing Basic MedGemma Functionality")
    print("=" * 50)
    
    # First try MedGemma, then fallback
    assistant = None
    using_fallback = False
    
    try:
        print("🔄 Attempting to load MedGemma model...")
        assistant = MedicalAssistant()
        print("✅ MedGemma model loaded successfully!")
        
    except Exception as e:
        print(f"⚠️  MedGemma unavailable: {str(e)[:100]}...")
        print("🔄 Switching to demo mode with fallback assistant...")
        
        try:
            assistant = FallbackMedicalAssistant(use_mock=True)
            using_fallback = True
            print("✅ Demo mode initialized successfully!")
        except Exception as fallback_error:
            print(f"❌ Fallback demo failed: {str(fallback_error)}")
            return False
    
    if assistant is None:
        print("❌ Could not initialize any assistant")
        return False
    
    # Test queries for demonstration
    test_queries = [
        {
            "query": "I have a headache and fever for 2 days",
            "context": {"age": 35, "sex": "female"}
        },
        {
            "query": "Sharp chest pain when breathing deeply",
            "context": {"age": 45, "sex": "male", "medical_history": "hypertension"}
        },
        {
            "query": "Mild cough and runny nose for 3 days",
            "context": {"age": 28, "sex": "other"}
        }
    ]
    
    if using_fallback:
        print("\n🎭 Running Demo with Mock Medical Responses")
        print("� This demonstrates the system architecture and user experience")
    else:
        print("\n🔬 Testing Live MedGemma Model")
    
    print("-" * 40)
    
    for i, test in enumerate(test_queries, 1):
        print(f"\n📝 Test Query {i}: {test['query']}")
        print("🤔 Processing...")
        
        response = assistant.ask(test['query'], test.get('context'))
        
        if response['status'] == 'success':
            print(f"✅ Response received (Urgency: {response['urgency_level'].title()})")
            print(f"📋 Recommendations: {len(response['recommendations'])} items")
            
            # Show first recommendation as example
            if response['recommendations']:
                print(f"   💡 Key recommendation: {response['recommendations'][0]}")
            
            # Show demo note if using fallback
            if response.get('note') and using_fallback:
                print(f"   📝 {response['note']}")
            
        else:
            print(f"❌ Error: {response['message']}")
        
        time.sleep(1)  # Brief pause between tests
    
    if using_fallback:
        print(f"\n🎯 Demo completed successfully!")
        print("💡 To use the full MedGemma model, see authentication instructions below.")
        _show_medgemma_setup_instructions()
    
    return True


def demo_local_model():
    """Test the local AI model functionality."""
    print("🤖 Testing Local AI Model")
    print("=" * 50)
    
    try:
        print("🔄 Loading local medical AI model...")
        assistant = FallbackMedicalAssistant(use_mock=False)  # Try to load local model
        
        if assistant.local_model:
            print("✅ Local AI model loaded successfully!")
            print("🧠 This uses a real AI model running locally on your machine")
        else:
            print("⚠️ Local model unavailable, using smart mock responses")
        
        test_queries = [
            "I have a headache and feel nauseous",
            "Sharp pain in my chest when I breathe",
            "Runny nose, sneezing, and sore throat for 3 days"
        ]
        
        print("\n🔬 Testing Medical AI Responses:")
        print("-" * 40)
        
        for i, query in enumerate(test_queries, 1):
            print(f"\n📝 Test {i}: {query}")
            print("🤔 Processing...")
            
            response = assistant.ask(query)
            
            if response['status'] == 'success':
                print(f"✅ AI Response generated")
                print(f"📋 Recommendations: {len(response['recommendations'])} items")
                print(f"🚨 Urgency: {response['urgency_level'].title()}")
                
                # Show partial response
                response_text = response['response'][:200] + "..." if len(response['response']) > 200 else response['response']
                print(f"💬 Response: {response_text}")
                
            else:
                print(f"❌ Error: {response['message']}")
        
        return True
        
    except Exception as e:
        print(f"❌ Local model test failed: {str(e)}")
        return False
def demo_prescreening_engine():
    """Demonstrate the prescreening and triage system."""
    print("\n🏥 Testing Prescreening & Triage Engine")
    print("=" * 50)
    
    try:
        engine = PrescreeningEngine()
        
        test_scenarios = [
            {
                "query": "Severe chest pain and can't breathe",
                "expected_urgency": "immediate"
            },
            {
                "query": "Persistent cough with fever for a week",
                "expected_urgency": "urgent"
            },
            {
                "query": "Mild headache after long day at work",
                "expected_urgency": "low"
            }
        ]
        
        for i, scenario in enumerate(test_scenarios, 1):
            print(f"\n📊 Scenario {i}: {scenario['query']}")
            
            analysis = engine.analyze_query(scenario['query'])
            
            print(f"   🚨 Urgency Level: {analysis['urgency_level'].title()}")
            print(f"   🏥 Medical Domains: {', '.join(analysis['medical_domains'])}")
            print(f"   📋 Recommendations: {len(analysis['recommendations'])}")
            
            # Verify urgency classification
            if analysis['urgency_level'] == scenario['expected_urgency']:
                print("   ✅ Urgency classification correct")
            else:
                print(f"   ⚠️  Expected {scenario['expected_urgency']}, got {analysis['urgency_level']}")
        
        return True
        
    except Exception as e:
        print(f"❌ Prescreening demo failed: {str(e)}")
        return False


def demo_interactive_chat():
    """Start the interactive chat demo."""
    print("\n💬 Interactive Chat Demo")
    print("=" * 50)
    
    # Try MedGemma first, then fallback
    assistant = None
    using_fallback = False
    
    print("🚀 Starting interactive medical prescreening session...")
    print("💡 Try questions like:")
    print("   • 'I have a fever and sore throat'")
    print("   • 'Sharp pain in my lower back'")
    print("   • 'Feeling anxious and heart racing'")
    print("\n⚠️  Note: This may take a moment to load the model...\n")
    
    try:
        print("🔄 Attempting to load MedGemma model...")
        assistant = MedicalAssistant()
        print("✅ MedGemma loaded! Starting full experience...")
        
    except Exception as e:
        print(f"⚠️  MedGemma unavailable: {str(e)[:100]}...")
        print("🔄 Switching to local AI mode...")
        
        try:
            assistant = FallbackMedicalAssistant(use_mock=False)  # Use local AI, not mock
            using_fallback = True
            print("✅ Local AI mode ready!")
            
        except Exception as fallback_error:
            print(f"❌ Local AI failed: {str(fallback_error)}")
            print("🔄 Falling back to mock responses...")
            try:
                assistant = FallbackMedicalAssistant(use_mock=True)
                print("✅ Mock mode ready!")
            except:
                return False
    
    if assistant is None:
        print("❌ Could not initialize assistant")
        return False
    
    try:
        # Use the ChatInterface for both MedGemma and fallback
        chat = ChatInterface(assistant)
        chat.start_session()
        
        return True
        
    except Exception as e:
        print(f"❌ Chat demo failed: {str(e)}")
        print(f"💡 You can still test basic functionality with option 1")
        return False


def demo_interactive_local_ai():
    """Interactive chat specifically with local AI model."""
    print("\n🤖💬 Interactive Local AI Chat")
    print("=" * 50)
    
    print("🚀 Loading local AI model for interactive chat...")
    print("💡 This uses real AI (DistilGPT2) running on your machine")
    print("⚠️  Note: This may take a moment to load the model...\n")
    
    try:
        # Force local AI, no mock responses
        assistant = FallbackMedicalAssistant(use_mock=False)
        print("✅ Local AI model loaded successfully!")
        
        # Use ChatInterface with the local AI
        chat = ChatInterface(assistant)
        chat.start_session()
        
        return True
        
    except Exception as e:
        print(f"❌ Local AI chat failed: {str(e)}")
        print(f"💡 Try option 2 to test the local AI model first")
        return False


def demo_icd10_codes():
    """Demonstrate ICD-10 code generation functionality."""
    print("\n📋 ICD-10 Code Generation Demo")
    print("=" * 50)
    
    try:
        from src.icd10_mapper import ICD10Mapper
        mapper = ICD10Mapper()
        print("✅ ICD-10 mapper loaded successfully!")
    except ImportError as e:
        print(f"❌ Could not load ICD-10 mapper: {str(e)}")
        return False
    
    print("🧠 Testing medical coding with sample symptom combinations\n")
    
    # Test cases with different complexity levels
    test_cases = [
        {
            'symptoms': "I have a persistent cough and fever for 3 days",
            'description': "Common cold symptoms"
        },
        {
            'symptoms': "Severe chest pain and shortness of breath when walking",
            'description': "Cardiovascular symptoms"
        },
        {
            'symptoms': "Bad headache with nausea and sensitivity to light",
            'description': "Neurological symptoms"
        },
        {
            'symptoms': "Runny nose, sore throat, sneezing, and feeling tired",
            'description': "Upper respiratory infection symptoms"
        },
        {
            'symptoms': "Lower back pain that radiates down my leg",
            'description': "Musculoskeletal symptoms"
        }
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"🔬 Test Case {i}: {test_case['description']}")
        print(f"📝 Symptoms: \"{test_case['symptoms']}\"")
        print("🤔 Processing...")
        
        try:
            report = mapper.generate_icd10_report(test_case['symptoms'])
            
            if report['has_suggestions']:
                print(f"✅ Found {report['total_codes']} ICD-10 code suggestions:")
                
                # Display top 3 suggestions
                for j, suggestion in enumerate(report['suggestions'][:3], 1):
                    confidence_text = suggestion['confidence_text']
                    percentage = suggestion['percentage']
                    
                    print(f"   {j}. Code: {suggestion['code']}")
                    print(f"      Description: {suggestion['description']}")
                    print(f"      Confidence: {confidence_text} ({percentage}%)")
                    if j < 3 and j < len(report['suggestions']):
                        print()
                
                print(f"💡 Note: {report['disclaimer'][:100]}...")
                
            else:
                print("❌ No ICD-10 codes could be mapped")
                
        except Exception as e:
            print(f"❌ Error processing case: {str(e)}")
        
        print("-" * 60)
        print()
    
    print("🎯 ICD-10 Demo Complete!")
    print("💡 In real usage, codes would be generated from interactive conversations")
    return True


def _show_medgemma_setup_instructions():
    """Show instructions for setting up MedGemma access."""
    print("\n" + "="*60)
    print("🔐 MedGemma Setup Instructions")
    print("="*60)
    print("MedGemma is a gated model that requires approval and authentication.")
    print()
    print("📋 Steps to get access:")
    print("1. 🌐 Visit: https://huggingface.co/google/medgemma-4b-it")
    print("2. 📝 Request access (requires Google account)")
    print("3. ⏳ Wait for approval from Google/Hugging Face")
    print("4. 🔑 Get your Hugging Face token:")
    print("   • Go to https://huggingface.co/settings/tokens")
    print("   • Create a new token with 'read' permissions")
    print("5. 🔧 Authenticate locally:")
    print("   • Run: huggingface-cli login")
    print("   • Enter your token when prompted")
    print()
    print("💡 Alternative: Set HF_TOKEN environment variable")
    print("   export HF_TOKEN='your_token_here'")
    print()
    print("⚠️  Note: Approval may take some time. This demo works without it!")
    print("="*60)


def show_project_info():
    """Display project information and capabilities."""
    print("📋 MedGemma Medical Prescreening System")
    print("=" * 50)
    print("🎯 Purpose: Hackathon prototype for AI-powered medical triage")
    print("🤖 Model: Google MedGemma 4B (Instruction-tuned) + Fallback")
    print("💻 Platform: CPU-optimized for development")
    print()
    print("🔧 Features:")
    print("   • Natural language symptom analysis")
    print("   • Intelligent triage and urgency classification")
    print("   • Structured medical recommendations")
    print("   • Patient context integration")
    print("   • Interactive chat interface")
    print("   • Emergency detection and routing")
    print("   • Fallback demo mode when MedGemma unavailable")
    print()
    print("🏥 Medical Domains Supported:")
    print("   • General medicine • Cardiology • Pulmonology")
    print("   • Gastroenterology • Neurology • Dermatology")
    print("   • Orthopedics • Mental health • Infectious diseases")
    print()
    print("🎭 Demo Modes:")
    print("   • Full MedGemma: Best medical AI performance")
    print("   • Fallback: Alternative models or mock responses")
    print("   • Prescreening Engine: Standalone triage classification")
    print()
    print("⚠️  Disclaimers:")
    print("   • Prototype for demonstration only")
    print("   • Not intended for actual medical diagnosis")
    print("   • Always consult healthcare professionals")
    print()
    print("🔐 MedGemma Access:")
    print("   Currently requires approval from Google/Hugging Face")
    print("   Visit: https://huggingface.co/google/medgemma-4b-it")
    print()


def main():
    """Main demo menu."""
    print("🩺 MedGemma Medical Prescreening System - Hackathon Demo")
    print("=" * 60)
    print("🚀 Welcome to the AI-powered medical triage prototype!")
    print()
    
    while True:
        print("\n📋 Demo Options:")
        print("1. 🧪 Test Basic Functionality (Smart Mock Responses)")
        print("2. 🤖 Test Local AI Model (Real AI, No Internet Required)")
        print("3. 🏥 Test Prescreening Engine (Triage Classification)")
        print("4. 💬 Interactive Chat Session (Full Experience)")
        print("5. 🤖💬 Interactive Local AI Chat (Real AI Conversation)")
        print("6. 📋 ICD-10 Code Generation Demo (Medical Coding)")
        print("7. 📋 Project Information")
        print("8. 🔐 MedGemma Setup Instructions")
        print("9. 🚪 Exit")
        print()
        
        try:
            choice = input("Select option (1-9): ").strip()
            
            if choice == '1':
                demo_basic_functionality()
                
            elif choice == '2':
                demo_local_model()
                
            elif choice == '3':
                demo_prescreening_engine()
                
            elif choice == '4':
                demo_interactive_chat()
                
            elif choice == '5':
                demo_interactive_local_ai()
                
            elif choice == '6':
                demo_icd10_codes()
                
            elif choice == '7':
                show_project_info()
                
            elif choice == '8':
                show_medgemma_setup()
                
            elif choice == '9':
                print("\n👋 Thank you for trying MedGemma Medical Prescreening!")
                print("🏥 Remember: Always consult healthcare professionals for medical advice.")
                break
                
            else:
                print("❌ Invalid option. Please select 1-9.")
                
        except KeyboardInterrupt:
            print("\n\n👋 Demo interrupted. Goodbye!")
            break
        except Exception as e:
            print(f"\n❌ An error occurred: {str(e)}")
            print("Please try again or select a different option.")


if __name__ == "__main__":
    main()