"""
Local model runner for medical AI without requiring gated model access.
Uses open-source models that can run locally.
"""

import torch
from transformers import pipeline, AutoTokenizer, AutoModelForCausalLM
import warnings
warnings.filterwarnings("ignore")


class LocalMedicalModel:
    """
    Local medical AI using open-source models.
    """
    
    def __init__(self):
        self.model = None
        self.tokenizer = None
        self.pipeline = None
        self.model_name = None
        
    def load_best_available_model(self):
        """Try to load the best available local model."""
        
        # Models to try (in order of preference)
        models_to_try = [
            {
                "name": "microsoft/DialoGPT-medium",
                "type": "conversational",
                "description": "Conversational AI - good for medical dialogue"
            },
            {
                "name": "distilgpt2", 
                "type": "text-generation",
                "description": "Lightweight GPT model"
            },
            {
                "name": "google/flan-t5-small",
                "type": "text2text-generation", 
                "description": "Instruction-following model"
            }
        ]
        
        for model_info in models_to_try:
            try:
                print(f"🔄 Trying {model_info['name']}...")
                
                if model_info['type'] == 'conversational':
                    self.pipeline = pipeline(
                        "conversational",
                        model=model_info['name'],
                        device=-1,  # CPU
                        torch_dtype=torch.float32
                    )
                elif model_info['type'] == 'text2text-generation':
                    self.pipeline = pipeline(
                        "text2text-generation",
                        model=model_info['name'],
                        device=-1,
                        torch_dtype=torch.float32
                    )
                else:
                    self.pipeline = pipeline(
                        "text-generation",
                        model=model_info['name'],
                        device=-1,
                        torch_dtype=torch.float32
                    )
                
                self.model_name = model_info['name']
                print(f"✅ Successfully loaded: {model_info['description']}")
                return True
                
            except Exception as e:
                print(f"❌ Failed to load {model_info['name']}: {str(e)}")
                continue
        
        print("❌ No models could be loaded")
        return False
    
    def generate_medical_response(self, query: str, patient_context=None):
        """Generate medical response using loaded model."""
        if not self.pipeline:
            return "Model not loaded. Please try loading a model first."
        
        try:
            # Create medical prompt
            medical_prompt = self._create_medical_prompt(query, patient_context)
            
            if "conversational" in str(type(self.pipeline)):
                # Use conversational pipeline
                from transformers import Conversation
                conversation = Conversation(medical_prompt)
                result = self.pipeline(conversation)
                return result.generated_responses[-1]
            
            elif "text2text" in str(type(self.pipeline)):
                # Use text2text pipeline (like T5)
                result = self.pipeline(medical_prompt, max_length=200, temperature=0.7)
                return result[0]['generated_text']
            
            else:
                # Use text generation pipeline
                result = self.pipeline(
                    medical_prompt, 
                    max_new_tokens=150,
                    temperature=0.7,
                    pad_token_id=50256,  # GPT-2 EOS token
                    do_sample=True
                )
                generated = result[0]['generated_text']
                # Remove the prompt from the response
                response = generated[len(medical_prompt):].strip()
                return response
                
        except Exception as e:
            return f"Error generating response: {str(e)}"
    
    def _create_medical_prompt(self, query: str, patient_context=None):
        """Create a medical-focused prompt."""
        
        # Simple, direct prompt that works better with smaller models
        prompt = f"Medical question: {query}\nMedical advice: This could be related to"
        
        return prompt


if __name__ == "__main__":
    # Test the local model
    print("🧪 Testing Local Medical Model")
    print("=" * 40)
    
    model = LocalMedicalModel()
    
    if model.load_best_available_model():
        print(f"\n📝 Testing with model: {model.model_name}")
        
        test_query = "I have a headache and feel tired"
        print(f"Query: {test_query}")
        
        response = model.generate_medical_response(test_query)
        print(f"Response: {response}")
    else:
        print("No models available for testing")