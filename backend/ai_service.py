import google.genai as genai
from config import config

class AIService:
    def __init__(self):
        if not config.GOOGLE_AI_API_KEY:
            raise ValueError("GOOGLE_AI_API_KEY environment variable is required")

        self.client = genai.Client(api_key=config.GOOGLE_AI_API_KEY)

    async def clean_resume_text(self, text: str) -> str:
        """Clean resume text using Google Gemini AI"""
        try:
            prompt = """You are a professional resume editor. Clean the following resume text by fixing all grammar and punctuation errors. Do not change the meaning, content structure, or formatting. Only fix grammatical errors, spelling mistakes, and punctuation. Return only the corrected text maintaining the original structure and format.

Resume text to clean:
"""

            full_prompt = prompt + text

            response = self.client.models.generate_content(
                model="gemini-2.5-flash",
                contents=full_prompt
            )

            # Extract the cleaned text from the response
            cleaned_text = response.text.strip()

            return cleaned_text

        except Exception as e:
            raise Exception(f"Error cleaning resume with AI: {str(e)}")

# Global AI service instance
ai_service = AIService()