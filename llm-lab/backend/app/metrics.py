"""
Custom Quality Metrics for LLM Response Evaluation

These metrics provide programmatic assessment of LLM responses without relying on another LLM.
"""

import re
import math
from collections import Counter
from typing import Dict, Any


class ResponseMetrics:
    """Calculate quality metrics for LLM responses"""
    
    @staticmethod
    def calculate_all_metrics(text: str) -> Dict[str, Any]:
        """Calculate all metrics for a given text"""
        return {
            "coherence_score": ResponseMetrics.coherence_score(text),
            "lexical_diversity": ResponseMetrics.lexical_diversity(text),
            "completeness_score": ResponseMetrics.completeness_score(text),
            "structure_score": ResponseMetrics.structure_score(text),
            "readability_score": ResponseMetrics.readability_score(text),
            "length_appropriateness": ResponseMetrics.length_appropriateness(text),
        }
    
    @staticmethod
    def coherence_score(text: str) -> float:
        """
        Measure coherence based on sentence connectivity and repetition patterns.
        
        Rationale: Coherent text has:
        - Consistent use of transition words
        - Low repetition of phrases
        - Logical sentence flow
        
        Score: 0.0 (poor) to 1.0 (excellent)
        """
        if not text or len(text.strip()) == 0:
            return 0.0
        
        sentences = re.split(r'[.!?]+', text)
        sentences = [s.strip() for s in sentences if s.strip()]
        
        if len(sentences) < 2:
            return 0.5  # Single sentence - neutral score
        
        # Check for transition words (indicators of coherence)
        transition_words = {
            'however', 'therefore', 'furthermore', 'moreover', 'additionally',
            'consequently', 'thus', 'hence', 'nevertheless', 'meanwhile',
            'subsequently', 'specifically', 'particularly', 'similarly',
            'conversely', 'alternatively', 'in addition', 'for example',
            'in contrast', 'as a result', 'on the other hand'
        }
        
        text_lower = text.lower()
        transition_count = sum(1 for word in transition_words if word in text_lower)
        transition_ratio = min(transition_count / len(sentences), 1.0)
        
        # Check for excessive repetition (indicates poor coherence)
        words = re.findall(r'\b\w+\b', text.lower())
        if len(words) < 10:
            repetition_penalty = 0
        else:
            # Get 3-grams and check repetition
            trigrams = [' '.join(words[i:i+3]) for i in range(len(words)-2)]
            trigram_counts = Counter(trigrams)
            max_repetition = max(trigram_counts.values()) if trigram_counts else 1
            repetition_penalty = min((max_repetition - 1) * 0.1, 0.5)
        
        # Combine metrics
        coherence = (transition_ratio * 0.6) + (0.4 * (1 - repetition_penalty))
        
        return round(min(max(coherence, 0.0), 1.0), 3)
    
    @staticmethod
    def lexical_diversity(text: str) -> float:
        """
        Type-Token Ratio (TTR) - ratio of unique words to total words.
        
        Rationale: Higher diversity indicates richer vocabulary and
        less repetitive responses. Temperature often affects this.
        
        Score: 0.0 (low diversity) to 1.0 (high diversity)
        """
        if not text or len(text.strip()) == 0:
            return 0.0
        
        words = re.findall(r'\b\w+\b', text.lower())
        
        if len(words) == 0:
            return 0.0
        
        unique_words = set(words)
        ttr = len(unique_words) / len(words)
        
        # Adjust for length (longer texts naturally have lower TTR)
        # Use moving-average TTR for longer texts
        if len(words) > 100:
            window_size = 50
            ttrs = []
            for i in range(0, len(words) - window_size, 25):
                window = words[i:i+window_size]
                window_ttr = len(set(window)) / len(window)
                ttrs.append(window_ttr)
            ttr = sum(ttrs) / len(ttrs) if ttrs else ttr
        
        return round(min(ttr, 1.0), 3)
    
    @staticmethod
    def completeness_score(text: str) -> float:
        """
        Assess if response appears complete based on structural cues.
        
        Rationale: Complete responses typically:
        - End with proper punctuation
        - Have multiple sentences
        - Don't end mid-thought
        
        Score: 0.0 (incomplete) to 1.0 (complete)
        """
        if not text or len(text.strip()) == 0:
            return 0.0
        
        text = text.strip()
        score = 0.0
        
        # Check if ends with proper punctuation
        if text[-1] in '.!?"':
            score += 0.4
        
        # Check sentence count
        sentences = re.split(r'[.!?]+', text)
        sentences = [s.strip() for s in sentences if s.strip()]
        
        if len(sentences) >= 3:
            score += 0.3
        elif len(sentences) >= 2:
            score += 0.2
        elif len(sentences) == 1:
            score += 0.1
        
        # Check for incomplete indicators
        incomplete_indicators = ['...', 'to be continued', 'in conclusion', 'finally']
        has_conclusion = any(indicator in text.lower() for indicator in ['in conclusion', 'finally', 'to summarize', 'in summary'])
        
        if has_conclusion:
            score += 0.2
        
        # Penalize if ends with ellipsis or comma
        if text[-1] in ',.;:':
            score -= 0.1
        
        # Check average sentence length (very short might indicate truncation)
        if sentences:
            avg_length = sum(len(s.split()) for s in sentences) / len(sentences)
            if avg_length >= 10:
                score += 0.1
        
        return round(min(max(score, 0.0), 1.0), 3)
    
    @staticmethod
    def structure_score(text: str) -> float:
        """
        Evaluate structural quality (paragraphs, lists, formatting).
        
        Rationale: Well-structured responses use:
        - Multiple paragraphs
        - Lists or bullet points when appropriate
        - Proper formatting
        
        Score: 0.0 (poor structure) to 1.0 (excellent structure)
        """
        if not text or len(text.strip()) == 0:
            return 0.0
        
        score = 0.0
        
        # Check for paragraphs (double line breaks)
        paragraphs = text.split('\n\n')
        paragraphs = [p.strip() for p in paragraphs if p.strip()]
        
        if len(paragraphs) >= 3:
            score += 0.3
        elif len(paragraphs) == 2:
            score += 0.2
        elif len(paragraphs) == 1:
            score += 0.1
        
        # Check for lists
        has_numbered_list = bool(re.search(r'^\s*\d+\.', text, re.MULTILINE))
        has_bullet_list = bool(re.search(r'^\s*[-*•]', text, re.MULTILINE))
        
        if has_numbered_list or has_bullet_list:
            score += 0.3
        
        # Check for proper sentence structure
        sentences = re.split(r'[.!?]+', text)
        sentences = [s.strip() for s in sentences if s.strip()]
        
        if sentences:
            # Good variation in sentence length
            lengths = [len(s.split()) for s in sentences]
            avg_length = sum(lengths) / len(lengths)
            std_dev = math.sqrt(sum((x - avg_length) ** 2 for x in lengths) / len(lengths))
            
            # Higher variance in sentence length is generally better
            if std_dev > 5:
                score += 0.2
            elif std_dev > 3:
                score += 0.1
        
        # Check for headers or section markers
        has_headers = bool(re.search(r'^#+\s+.+$|^[A-Z][^.!?]*:$', text, re.MULTILINE))
        if has_headers:
            score += 0.2
        
        return round(min(max(score, 0.0), 1.0), 3)
    
    @staticmethod
    def readability_score(text: str) -> float:
        """
        Simplified Flesch Reading Ease approximation.
        
        Rationale: Readable text balances sentence and word length.
        Too complex or too simple both score lower.
        
        Score: 0.0 (poor readability) to 1.0 (excellent readability)
        """
        if not text or len(text.strip()) == 0:
            return 0.0
        
        sentences = re.split(r'[.!?]+', text)
        sentences = [s.strip() for s in sentences if s.strip()]
        
        if not sentences:
            return 0.0
        
        words = re.findall(r'\b\w+\b', text)
        
        if not words:
            return 0.0
        
        # Average words per sentence
        avg_words_per_sentence = len(words) / len(sentences)
        
        # Average syllables per word (approximated by character count)
        avg_chars_per_word = sum(len(word) for word in words) / len(words)
        
        # Simplified readability formula
        # Optimal: 15-20 words per sentence, 4-6 chars per word
        sentence_score = 1.0 - min(abs(avg_words_per_sentence - 17.5) / 17.5, 1.0)
        word_score = 1.0 - min(abs(avg_chars_per_word - 5) / 5, 1.0)
        
        readability = (sentence_score * 0.6) + (word_score * 0.4)
        
        return round(min(max(readability, 0.0), 1.0), 3)
    
    @staticmethod
    def length_appropriateness(text: str) -> float:
        """
        Evaluate if response length is appropriate (not too short or verbose).
        
        Rationale: Quality responses are typically 50-500 words.
        Very short suggests incompleteness; very long suggests verbosity.
        
        Score: 0.0 (inappropriate length) to 1.0 (appropriate length)
        """
        if not text or len(text.strip()) == 0:
            return 0.0
        
        words = re.findall(r'\b\w+\b', text)
        word_count = len(words)
        
        # Optimal range: 75-300 words
        if 75 <= word_count <= 300:
            return 1.0
        elif 50 <= word_count < 75:
            return 0.7 + ((word_count - 50) / 25) * 0.3
        elif 300 < word_count <= 500:
            return 1.0 - ((word_count - 300) / 200) * 0.3
        elif 25 <= word_count < 50:
            return 0.4 + ((word_count - 25) / 25) * 0.3
        elif word_count < 25:
            return max(word_count / 25 * 0.4, 0.1)
        else:  # > 500 words
            return max(0.7 - ((word_count - 500) / 500) * 0.5, 0.2)
    
    @staticmethod
    def calculate_overall_score(metrics: Dict[str, float]) -> float:
        """
        Calculate weighted overall quality score from individual metrics.
        
        Weights prioritize coherence and completeness as primary indicators.
        """
        weights = {
            "coherence_score": 0.25,
            "lexical_diversity": 0.15,
            "completeness_score": 0.25,
            "structure_score": 0.15,
            "readability_score": 0.10,
            "length_appropriateness": 0.10,
        }
        
        overall = sum(metrics.get(key, 0) * weight for key, weight in weights.items())
        return round(overall, 3)

