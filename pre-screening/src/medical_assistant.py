"""
Medical Assistant using MedGemma model for prescreening and symptom analysis.
"""

import torch
from transformers import AutoProcessor, AutoModelForCausalLM
from typing import Dict, List, Optional
import json
import logging


class MedicalAssistant:
    """
    A medical assistant powered by MedGemma for patient prescreening.
    
    This class handles text-based medical queries, symptom analysis,
    and provides structured responses for healthcare prescreening.
    """
    
    def __init__(self, model_name: str = "google/medgemma-4b-it", device: str = "cpu"):
        """
        Initialize the Medical Assistant with MedGemma model.
        
        Args:
            model_name: HuggingFace model identifier for MedGemma
            device: Device to run the model on ('cpu' or 'cuda')
        """
        self.model_name = model_name
        self.device = device
        self.model = None
        self.processor = None
        
        # Configure logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
        
        # System prompt for medical prescreening
        self.system_prompt = """You are a medical AI assistant specialized in patient prescreening. Your role is to:
1. Analyze patient symptoms and medical history
2. Ask relevant follow-up questions to gather comprehensive information
3. Provide preliminary assessments and triage recommendations
4. Suggest appropriate next steps for care

Always maintain a professional, empathetic tone and remind patients that this is preliminary guidance, not a medical diagnosis. Encourage patients to seek appropriate medical care when needed."""
        
        self._load_model()
    
    def _load_model(self) -> None:
        """Load the MedGemma model and processor."""
        try:
            self.logger.info(f"Loading MedGemma model: {self.model_name}")
            
            # Load processor and model
            self.processor = AutoProcessor.from_pretrained(self.model_name)
            self.model = AutoModelForCausalLM.from_pretrained(
                self.model_name,
                torch_dtype=torch.float32,  # Use float32 for CPU
                device_map="auto" if self.device == "cuda" else None,
                trust_remote_code=True
            )
            
            if self.device == "cpu":
                self.model = self.model.to("cpu")
            
            self.logger.info("Model loaded successfully!")
            
        except Exception as e:
            self.logger.error(f"Error loading model: {str(e)}")
            raise RuntimeError(f"Failed to load MedGemma model: {str(e)}")
    
    def ask(self, query: str, patient_context: Optional[Dict] = None) -> Dict:
        """
        Process a medical query and return structured response.
        
        Args:
            query: Patient's medical question or symptom description
            patient_context: Optional patient information (age, sex, medical history)
            
        Returns:
            Dictionary containing the medical response and recommendations
        """
        try:
            # Build conversation messages
            messages = self._build_messages(query, patient_context)
            
            # Generate response
            response_text = self._generate_response(messages)
            
            # Structure the response
            structured_response = self._structure_response(query, response_text)
            
            return structured_response
            
        except Exception as e:
            self.logger.error(f"Error processing query: {str(e)}")
            return {
                "status": "error",
                "message": f"Sorry, I encountered an error processing your request: {str(e)}",
                "recommendations": ["Please try again or consult a healthcare provider directly."]
            }
    
    def _build_messages(self, query: str, patient_context: Optional[Dict] = None) -> List[Dict]:
        """Build the conversation messages for the model."""
        messages = [
            {
                "role": "system",
                "content": [{"type": "text", "text": self.system_prompt}]
            }
        ]
        
        # Add patient context if provided
        if patient_context:
            context_text = self._format_patient_context(patient_context)
            messages.append({
                "role": "user",
                "content": [{"type": "text", "text": f"Patient context: {context_text}"}]
            })
        
        # Add the main query
        messages.append({
            "role": "user", 
            "content": [{"type": "text", "text": query}]
        })
        
        return messages
    
    def _format_patient_context(self, context: Dict) -> str:
        """Format patient context into a readable string."""
        context_parts = []
        if "age" in context:
            context_parts.append(f"Age: {context['age']}")
        if "sex" in context:
            context_parts.append(f"Sex: {context['sex']}")
        if "medical_history" in context:
            context_parts.append(f"Medical history: {context['medical_history']}")
        if "current_medications" in context:
            context_parts.append(f"Current medications: {context['current_medications']}")
        
        return "; ".join(context_parts)
    
    def _generate_response(self, messages: List[Dict]) -> str:
        """Generate response using the MedGemma model."""
        try:
            # Apply chat template
            inputs = self.processor.apply_chat_template(
                messages,
                add_generation_prompt=True,
                tokenize=True,
                return_dict=True,
                return_tensors="pt"
            )
            
            if self.device == "cpu":
                inputs = {k: v.to("cpu") for k, v in inputs.items()}
            
            input_len = inputs["input_ids"].shape[-1]
            
            # Generate response
            with torch.inference_mode():
                generation = self.model.generate(
                    **inputs,
                    max_new_tokens=500,  # Limit response length
                    do_sample=True,
                    temperature=0.7,
                    top_p=0.9,
                    pad_token_id=self.processor.tokenizer.eos_token_id
                )
                generation = generation[0][input_len:]
            
            # Decode response
            response = self.processor.decode(generation, skip_special_tokens=True)
            return response.strip()
            
        except Exception as e:
            self.logger.error(f"Error generating response: {str(e)}")
            raise
    
    def _structure_response(self, original_query: str, response_text: str) -> Dict:
        """Structure the model response into a standardized format."""
        return {
            "status": "success",
            "query": original_query,
            "response": response_text,
            "recommendations": self._extract_recommendations(response_text),
            "urgency_level": self._assess_urgency(original_query, response_text),
            "follow_up_questions": self._suggest_follow_up_questions(response_text),
            "timestamp": self._get_timestamp()
        }
    
    def _extract_recommendations(self, response_text: str) -> List[str]:
        """Extract actionable recommendations from the response."""
        recommendations = []
        
        # Simple heuristics to extract recommendations
        lines = response_text.split('\n')
        for line in lines:
            line = line.strip()
            if any(keyword in line.lower() for keyword in ['recommend', 'suggest', 'should', 'advise']):
                if len(line) > 10:  # Filter out very short lines
                    recommendations.append(line)
        
        # Default recommendations if none found
        if not recommendations:
            recommendations = [
                "Monitor your symptoms and note any changes",
                "Consider consulting with a healthcare provider if symptoms persist or worsen",
                "Keep track of when symptoms occur and any potential triggers"
            ]
        
        return recommendations[:3]  # Limit to top 3 recommendations
    
    def _assess_urgency(self, query: str, response_text: str) -> str:
        """Assess the urgency level of the medical query."""
        urgent_keywords = [
            'emergency', 'urgent', 'severe', 'chest pain', 'difficulty breathing',
            'bleeding', 'unconscious', 'allergic reaction', 'stroke', 'heart attack'
        ]
        
        moderate_keywords = [
            'fever', 'pain', 'infection', 'persistent', 'worsening'
        ]
        
        combined_text = (query + " " + response_text).lower()
        
        if any(keyword in combined_text for keyword in urgent_keywords):
            return "high"
        elif any(keyword in combined_text for keyword in moderate_keywords):
            return "moderate"
        else:
            return "low"
    
    def _suggest_follow_up_questions(self, response_text: str) -> List[str]:
        """Suggest relevant follow-up questions."""
        follow_up_questions = [
            "How long have you been experiencing these symptoms?",
            "Have you noticed any patterns or triggers?",
            "Are you currently taking any medications?",
            "Have you experienced similar symptoms before?",
            "Is there anything that makes the symptoms better or worse?"
        ]
        
        return follow_up_questions[:2]  # Return 2 relevant questions
    
    def _get_timestamp(self) -> str:
        """Get current timestamp."""
        from datetime import datetime
        return datetime.now().isoformat()
    
    def chat_session(self) -> None:
        """Start an interactive chat session."""
        print("🏥 MedGemma Medical Prescreening Assistant")
        print("=" * 50)
        print("I'm here to help with preliminary medical questions.")
        print("Remember: This is not a substitute for professional medical advice.")
        print("Type 'quit' to exit.\n")
        
        while True:
            try:
                query = input("👤 You: ").strip()
                
                if query.lower() in ['quit', 'exit', 'bye']:
                    print("👋 Take care! Remember to consult healthcare professionals for medical concerns.")
                    break
                
                if not query:
                    continue
                
                print("🤔 Thinking...")
                response = self.ask(query)
                
                if response["status"] == "success":
                    print(f"\n🏥 Medical Assistant: {response['response']}")
                    
                    if response["recommendations"]:
                        print(f"\n📋 Recommendations:")
                        for i, rec in enumerate(response["recommendations"], 1):
                            print(f"   {i}. {rec}")
                    
                    urgency = response["urgency_level"]
                    urgency_emoji = {"high": "🚨", "moderate": "⚠️", "low": "ℹ️"}
                    print(f"\n{urgency_emoji.get(urgency, 'ℹ️')} Urgency Level: {urgency.title()}")
                    
                else:
                    print(f"\n❌ {response['message']}")
                
                print("-" * 50)
                
            except KeyboardInterrupt:
                print("\n👋 Take care!")
                break
            except Exception as e:
                print(f"\n❌ An error occurred: {str(e)}")


if __name__ == "__main__":
    # Quick test
    assistant = MedicalAssistant()
    assistant.chat_session()