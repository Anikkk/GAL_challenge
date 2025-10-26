"""
LLM Service for generating responses with different parameter combinations
"""

import os
from typing import List, Dict, Tuple
import asyncio
from openai import AsyncOpenAI
from anthropic import AsyncAnthropic
from dotenv import load_dotenv

load_dotenv()


class LLMService:
    """Service for interacting with LLM APIs"""
    
    def __init__(self):
        self.openai_client = None
        # self.anthropic_client = None
           
        # Initialize clients if API keys are available
        openai_key = os.getenv("OPENAI_API_KEY")

        print("OpenAI Key:", openai_key)
        
        if openai_key:
            self.openai_client = AsyncOpenAI(api_key=openai_key)
    
    async def generate_response_openai(
        self,
        prompt: str,
        model: str,
        temperature: float,
        top_p: float
    ) -> str:
        """Generate response using OpenAI API"""
        if not self.openai_client:
            raise ValueError("OpenAI API key not configured")
        
        try:
            response = await self.openai_client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": prompt}],
                temperature=temperature,
                top_p=top_p,
                max_tokens=1000
            )
            print(response,"Hi this is the llmservice")
            return response.choices[0].message.content
        except Exception as e:
            raise Exception(f"OpenAI API error: {str(e)}")
    
    async def generate_response_anthropic(
        self,
        prompt: str,
        model: str,
        temperature: float,
        top_p: float
    ) -> str:
        """Generate response using Anthropic API"""
        if not self.anthropic_client:
            raise ValueError("Anthropic API key not configured")
        
        try:
            response = await self.anthropic_client.messages.create(
                model=model,
                max_tokens=1000,
                temperature=temperature,
                top_p=top_p,
                messages=[{"role": "user", "content": prompt}]
            )
            return response.content[0].text
        except Exception as e:
            raise Exception(f"Anthropic API error: {str(e)}")
    
    async def generate_response(
        self,
        prompt: str,
        model: str,
        temperature: float,
        top_p: float
    ) -> str:
        """Generate response using appropriate provider or mock"""
        # Determine provider based on model
        if model.startswith("gpt"):
            if self.openai_client:
                return await self.generate_response_openai(prompt, model, temperature, top_p)
        elif model.startswith("claude"):
            if self.anthropic_client:
                return await self.generate_response_anthropic(prompt, model, temperature, top_p)
        
        # Fallback to mock if no API keys available
        # return await self.generate_mock_response(prompt, model, temperature, top_p)
    
    async def generate_multiple_responses(
        self,
        prompt: str,
        model: str,
        temperature_range: List[float],
        top_p_range: List[float]
    ) -> List[Tuple[float, float, str]]:
        """Generate multiple responses with different parameter combinations"""
        tasks = []
        param_combinations = []
        
        # Create all parameter combinations
        for temp in temperature_range:
            for top_p in top_p_range:
                param_combinations.append((temp, top_p))
                tasks.append(self.generate_response(prompt, model, temp, top_p))
        
        # Execute all requests in parallel
        responses = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Combine parameters with responses
        results = []
        for i, response in enumerate(responses):
            temp, top_p = param_combinations[i]
            if isinstance(response, Exception):
                # Handle errors gracefully
                results.append((temp, top_p, f"Error: {str(response)}"))
            else:
                results.append((temp, top_p, response))
        
        return results

