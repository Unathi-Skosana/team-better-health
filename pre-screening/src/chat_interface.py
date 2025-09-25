"""
Chat interface for the medical prescreening system.
Provides an enhanced user experience for symptom collection and medical Q&A.
"""

from typing import Dict, List, Optional
from rich.console import Console
from rich.panel import Panel
from rich.text import Text
from rich.prompt import Prompt, Confirm
from rich.table import Table
from rich.layout import Layout
from rich.live import Live
import time
import json

try:
    from .icd10_mapper import ICD10Mapper
    from .medical_report import MedicalReportGenerator
except ImportError:
    ICD10Mapper = None
    MedicalReportGenerator = None


class ChatInterface:
    """
    Enhanced chat interface for medical prescreening with better UX.
    """
    
    def __init__(self, medical_assistant):
        """
        Initialize the chat interface.
        
        Args:
            medical_assistant: Instance of MedicalAssistant class
        """
        self.assistant = medical_assistant
        self.console = Console()
        self.patient_context = {}
        self.conversation_history = []
        self.all_symptoms_text = ""  # Collect all symptoms for ICD-10 mapping
        
        # Initialize ICD-10 mapper if available
        self.icd10_mapper = None
        if ICD10Mapper:
            self.icd10_mapper = ICD10Mapper()
        
        # Initialize medical report generator if available
        self.report_generator = None
        if MedicalReportGenerator:
            self.report_generator = MedicalReportGenerator()
        
    def start_session(self) -> None:
        """Start an interactive medical prescreening session."""
        self._display_welcome()
        self._collect_patient_info()
        self._main_chat_loop()
        
        # Generate ICD-10 report at end of session
        if self.icd10_mapper and self.all_symptoms_text.strip():
            self._generate_icd10_report()
        
        # Generate comprehensive medical report at end of session
        if self.report_generator and (self.all_symptoms_text.strip() or self.conversation_history):
            self._generate_medical_report()
        
    def _display_welcome(self) -> None:
        """Display welcome message and system information."""
        welcome_text = Text()
        welcome_text.append("MedGemma Medical Prescreening Assistant\n", style="bold blue")
        welcome_text.append("Powered by Google's MedGemma AI\n\n", style="dim")
        welcome_text.append("🏥 I'm here to help with preliminary medical assessment\n", style="green")
        welcome_text.append("⚠️  Important: This is NOT a substitute for professional medical advice\n", style="yellow")
        welcome_text.append("🚨 For medical emergencies, call emergency services immediately\n\n", style="red bold")
        welcome_text.append("Let's start with some basic information...", style="white")
        
        panel = Panel(
            welcome_text,
            title="🩺 Medical Prescreening System",
            border_style="blue",
            padding=(1, 2)
        )
        
        self.console.print(panel)
        self.console.print()
        
    def _collect_patient_info(self) -> None:
        """Collect basic patient information for context."""
        self.console.print("📋 [bold]Patient Information Collection[/bold]")
        self.console.print("(This information helps provide more accurate assessments)\n")
        
        # Age
        age = Prompt.ask("What is your age?", default="prefer not to say")
        if age.lower() != "prefer not to say":
            try:
                age = int(age)
                self.patient_context["age"] = age
            except ValueError:
                pass
        
        # Sex
        sex = Prompt.ask(
            "Sex (for medical context)", 
            choices=["male", "female", "other", "prefer not to say"],
            default="prefer not to say"
        )
        if sex != "prefer not to say":
            self.patient_context["sex"] = sex
        
        # Medical history
        has_conditions = Confirm.ask("Do you have any known medical conditions?")
        if has_conditions:
            conditions = Prompt.ask("Please briefly describe your medical conditions")
            self.patient_context["medical_history"] = conditions
        
        # Current medications
        has_medications = Confirm.ask("Are you currently taking any medications?")
        if has_medications:
            medications = Prompt.ask("Please list your current medications")
            self.patient_context["current_medications"] = medications
        
        # Confirm information
        if self.patient_context:
            self.console.print("\n📝 [bold]Patient Information Summary:[/bold]")
            table = Table(show_header=False, box=None)
            for key, value in self.patient_context.items():
                formatted_key = key.replace("_", " ").title()
                table.add_row(f"[blue]{formatted_key}:[/blue]", str(value))
            self.console.print(table)
            
            if not Confirm.ask("\nIs this information correct?"):
                self.patient_context = {}
                self.console.print("[yellow]Patient information cleared. Continuing without context.[/yellow]")
        
        self.console.print("\n" + "="*60 + "\n")
        
    def _main_chat_loop(self) -> None:
        """Main chat interaction loop."""
        self.console.print("💬 [bold green]Ready to help! Describe your symptoms or ask your medical question.[/bold green]")
        self.console.print("💡 [dim]Tips: Be specific about your symptoms, duration, and severity[/dim]")
        self.console.print("🚪 [dim]Type 'quit', 'exit', 'help', 'icd10', or 'report' for options[/dim]\n")
        
        while True:
            try:
                # Get user input
                user_input = Prompt.ask("[bold blue]You[/bold blue]").strip()
                
                if not user_input:
                    continue
                
                # Handle special commands
                if user_input.lower() in ['quit', 'exit', 'bye']:
                    self._display_goodbye()
                    break
                elif user_input.lower() == 'help':
                    self._show_help()
                    continue
                elif user_input.lower() == 'summary':
                    self._show_conversation_summary()
                    continue
                elif user_input.lower() == 'emergency':
                    self._show_emergency_info()
                    continue
                elif user_input.lower() == 'icd10':
                    self._generate_icd10_report()
                    continue
                elif user_input.lower() == 'report':
                    self._generate_medical_report()
                    continue
                
                # Process medical query
                self._process_query(user_input)
                
            except KeyboardInterrupt:
                self.console.print("\n[yellow]Session interrupted.[/yellow]")
                self._display_goodbye()
                break
            except Exception as e:
                self.console.print(f"\n[red]An error occurred: {str(e)}[/red]")
                self.console.print("Please try again or type 'quit' to exit.\n")
    
    def _process_query(self, query: str) -> None:
        """Process a medical query and display structured response."""
        # Collect symptoms for ICD-10 mapping
        self.all_symptoms_text += " " + query
        
        # Show thinking indicator
        with self.console.status("[bold green]Analyzing your symptoms..."):
            response = self.assistant.ask(query, self.patient_context)
        
        # Store in conversation history
        self.conversation_history.append({
            "query": query,
            "response": response,
            "timestamp": response.get("timestamp")
        })
        
        if response["status"] == "success":
            self._display_medical_response(response)
        else:
            self.console.print(f"\n[red]❌ {response['message']}[/red]\n")
    
    def _display_medical_response(self, response: Dict) -> None:
        """Display a structured medical response."""
        # Main response
        response_panel = Panel(
            response["response"],
            title="🏥 Medical Assessment",
            border_style="green",
            padding=(1, 2)
        )
        self.console.print(response_panel)
        
        # Urgency level
        urgency = response.get("urgency_level", "low")
        urgency_colors = {"high": "red", "moderate": "yellow", "low": "green"}
        urgency_emojis = {"high": "🚨", "moderate": "⚠️", "low": "ℹ️"}
        
        urgency_text = Text()
        urgency_text.append(f"{urgency_emojis.get(urgency, 'ℹ️')} Urgency Level: ", style="white")
        urgency_text.append(urgency.title(), style=f"bold {urgency_colors.get(urgency, 'white')}")
        
        self.console.print(urgency_text)
        
        # Recommendations
        if response.get("recommendations"):
            self.console.print("\n📋 [bold]Recommendations:[/bold]")
            for i, rec in enumerate(response["recommendations"], 1):
                self.console.print(f"   {i}. {rec}")
        
        # Follow-up questions
        if response.get("follow_up_questions"):
            self.console.print("\n🤔 [bold]Follow-up Questions:[/bold]")
            for question in response["follow_up_questions"]:
                self.console.print(f"   • {question}")
        
        # Emergency warning if high urgency
        if urgency == "high":
            emergency_panel = Panel(
                "🚨 HIGH URGENCY: Consider seeking immediate medical attention.\nIf this is a medical emergency, call emergency services.",
                title="⚠️ URGENT",
                border_style="red",
                padding=(1, 2)
            )
            self.console.print(emergency_panel)
        
        self.console.print("\n" + "-"*60 + "\n")
    
    def _show_help(self) -> None:
        """Show help information."""
        help_text = Text()
        help_text.append("Available Commands:\n\n", style="bold")
        help_text.append("help        - Show this help message\n")
        help_text.append("summary     - Show conversation summary\n")
        help_text.append("emergency   - Show emergency contact information\n")
        help_text.append("quit/exit   - End the session\n\n")
        help_text.append("Tips for better assessments:\n", style="bold")
        help_text.append("• Be specific about symptoms (location, severity, duration)\n")
        help_text.append("• Mention what makes symptoms better or worse\n")
        help_text.append("• Include relevant medical history\n")
        help_text.append("• Describe any recent changes or triggers\n")
        
        help_panel = Panel(
            help_text,
            title="🆘 Help & Tips",
            border_style="blue",
            padding=(1, 2)
        )
        self.console.print(help_panel)
        self.console.print()
    
    def _show_emergency_info(self) -> None:
        """Show emergency contact information."""
        emergency_text = Text()
        emergency_text.append("🚨 MEDICAL EMERGENCY CONTACTS 🚨\n\n", style="bold red")
        emergency_text.append("Emergency Services: 911 (US) / 999 (UK) / 112 (EU)\n", style="red")
        emergency_text.append("Poison Control: 1-800-222-1222 (US)\n", style="red")
        emergency_text.append("Crisis Text Line: Text HOME to 741741\n\n", style="red")
        emergency_text.append("Seek immediate help for:\n", style="bold")
        emergency_text.append("• Chest pain or difficulty breathing\n")
        emergency_text.append("• Severe bleeding or trauma\n")
        emergency_text.append("• Loss of consciousness\n")
        emergency_text.append("• Signs of stroke (FAST: Face, Arms, Speech, Time)\n")
        emergency_text.append("• Severe allergic reactions\n")
        emergency_text.append("• Thoughts of self-harm\n")
        
        emergency_panel = Panel(
            emergency_text,
            title="🚨 EMERGENCY INFORMATION",
            border_style="red",
            padding=(1, 2)
        )
        self.console.print(emergency_panel)
        self.console.print()
    
    def _show_conversation_summary(self) -> None:
        """Show summary of the conversation."""
        if not self.conversation_history:
            self.console.print("[yellow]No conversation history yet.[/yellow]\n")
            return
        
        self.console.print("📋 [bold]Conversation Summary:[/bold]\n")
        
        for i, entry in enumerate(self.conversation_history, 1):
            self.console.print(f"[blue]Query {i}:[/blue] {entry['query'][:100]}...")
            urgency = entry['response'].get('urgency_level', 'unknown')
            self.console.print(f"[dim]Urgency: {urgency.title()}[/dim]")
            
            if entry['response'].get('recommendations'):
                self.console.print("[dim]Key recommendations:[/dim]")
                for rec in entry['response']['recommendations'][:2]:
                    self.console.print(f"[dim]  • {rec}[/dim]")
            self.console.print()
    
    def _display_goodbye(self) -> None:
        """Display goodbye message."""
        goodbye_text = Text()
        goodbye_text.append("Thank you for using MedGemma Medical Prescreening!\n\n", style="bold blue")
        goodbye_text.append("Remember:\n", style="bold")
        goodbye_text.append("• This was preliminary guidance, not medical diagnosis\n")
        goodbye_text.append("• Consult healthcare professionals for proper medical care\n")
        goodbye_text.append("• Seek immediate help for medical emergencies\n\n")
        goodbye_text.append("Take care of yourself! 🏥💙", style="green")
        
        goodbye_panel = Panel(
            goodbye_text,
            title="👋 Session Complete",
            border_style="blue",
            padding=(1, 2)
        )
        
        self.console.print(goodbye_panel)
    
    def _generate_icd10_report(self) -> None:
        """Generate and display ICD-10 code suggestions based on conversation."""
        if not self.icd10_mapper:
            self.console.print("[red]❌ ICD-10 mapping not available[/red]\n")
            return
        
        if not self.all_symptoms_text.strip():
            self.console.print("[yellow]⚠️  No symptoms collected yet for ICD-10 mapping[/yellow]\n")
            return
        
        self.console.print("[bold blue]📋 Generating ICD-10 Code Report...[/bold blue]\n")
        
        with self.console.status("[bold green]Analyzing symptoms for ICD-10 codes..."):
            report = self.icd10_mapper.generate_icd10_report(
                self.all_symptoms_text, 
                self.patient_context
            )
        
        if not report['has_suggestions']:
            self.console.print("[yellow]❌ No ICD-10 codes could be mapped from symptoms[/yellow]\n")
            return
        
        # Display ICD-10 report header
        header_text = Text()
        header_text.append("ICD-10 Code Suggestions\n", style="bold blue")
        header_text.append(f"Based on conversation analysis • {report['total_codes']} codes identified\n", style="dim")
        
        header_panel = Panel(
            header_text,
            title="📋 Medical Coding Report",
            border_style="blue",
            padding=(1, 2)
        )
        self.console.print(header_panel)
        
        # Display each ICD-10 suggestion
        for i, suggestion in enumerate(report['suggestions'], 1):
            # Create table for each suggestion
            table = Table(show_header=False, box=None, padding=(0, 1))
            table.add_column("Field", style="bold", width=15)
            table.add_column("Value", width=50)
            
            # Add code and description
            table.add_row("Code:", f"[bold]{suggestion['code']}[/bold]")
            table.add_row("Description:", suggestion['description'])
            table.add_row("Confidence:", 
                         f"[{suggestion['confidence_color']}]{suggestion['confidence_text']} ({suggestion['percentage']}%)[/{suggestion['confidence_color']}]")
            
            # Add supporting symptoms
            symptoms_text = ", ".join(suggestion['supporting_symptoms'][:3])
            if len(suggestion['supporting_symptoms']) > 3:
                symptoms_text += f" (+{len(suggestion['supporting_symptoms']) - 3} more)"
            table.add_row("Based on:", symptoms_text)
            
            # Create panel for each suggestion
            panel_title = f"🏥 Suggestion {i}"
            if suggestion['confidence_score'] >= 0.8:
                border_style = "green"
            elif suggestion['confidence_score'] >= 0.6:
                border_style = "yellow"
            else:
                border_style = "red"
            
            suggestion_panel = Panel(
                table,
                title=panel_title,
                border_style=border_style,
                padding=(0, 1)
            )
            self.console.print(suggestion_panel)
        
        # Display disclaimer
        disclaimer_text = Text()
        disclaimer_text.append(report['disclaimer'], style="yellow")
        
        disclaimer_panel = Panel(
            disclaimer_text,
            title="⚠️  IMPORTANT DISCLAIMER",
            border_style="red",
            padding=(1, 2)
        )
        self.console.print(disclaimer_panel)
        self.console.print()
    
    def _generate_medical_report(self) -> None:
        """Generate and display comprehensive medical report."""
        if not self.report_generator:
            self.console.print("[red]❌ Medical report generation not available[/red]\n")
            return
        
        if not (self.all_symptoms_text.strip() or self.conversation_history):
            self.console.print("[yellow]⚠️  No consultation data available for report generation[/yellow]\n")
            return
        
        self.console.print("[bold blue]📋 Generating Professional Medical Report...[/bold blue]\n")
        
        with self.console.status("[bold green]Compiling comprehensive medical report..."):
            try:
                report = self.report_generator.generate_report(
                    patient_info=self.patient_context,
                    conversation_history=self.conversation_history,
                    symptoms_text=self.all_symptoms_text
                )
                
                # Display the report
                self.console.print("[bold green]✅ Medical Report Generated Successfully![/bold green]\n")
                self.report_generator.display_report(report)
                
                # Offer to save report
                self.console.print(f"\n💡 [dim]Report ID: {report['metadata']['report_id']}[/dim]")
                self.console.print("📄 [dim]This report can be saved or shared with healthcare providers[/dim]\n")
                
            except Exception as e:
                self.console.print(f"[red]❌ Error generating medical report: {str(e)}[/red]\n")
    
    def _show_help(self) -> None:
        """Show help information."""
        help_text = Text()
        help_text.append("Available Commands:\n", style="bold")
        help_text.append("• Simply describe your symptoms for medical assessment\n")
        help_text.append("• 'help' - Show this help message\n")
        help_text.append("• 'summary' - View conversation summary\n")
        help_text.append("• 'emergency' - Show emergency contact information\n")
        help_text.append("• 'icd10' - Generate ICD-10 code report\n")
        help_text.append("• 'report' - Generate comprehensive medical report\n")
        help_text.append("• 'quit' or 'exit' - End the session\n\n")
        help_text.append("Tips for better results:\n", style="bold")
        help_text.append("• Be specific about symptoms (location, severity, duration)\n")
        help_text.append("• Mention any triggers or patterns you've noticed\n")
        help_text.append("• Include relevant medical history if applicable\n")
        
        help_panel = Panel(
            help_text,
            title="💡 Help & Commands",
            border_style="cyan",
            padding=(1, 2)
        )
        self.console.print(help_panel)
        self.console.print()