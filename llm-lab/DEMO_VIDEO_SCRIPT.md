# Demo Video Script (5-10 minutes)

## Introduction (30 seconds)

"Hello! I'm excited to present LLM Lab, a full-stack web application I built for the GenAI-Labs Challenge. This tool helps users experiment with Large Language Model parameters and understand their impact on response quality through custom programmatic metrics.

Let me walk you through the application, my design decisions, and the challenges I faced."

## Application Overview (1 minute)

"First, let me show you the application running live at [deployed URL]. 

The interface is clean and modern, built with Next.js, TypeScript, and Tailwind CSS. You'll notice the gradient branding, smooth animations, and responsive design - all aimed at creating a professional, premium feel.

At the top, we have two main sections: 'New Experiment' for creating experiments, and 'History' for viewing past results."

## Creating an Experiment (2 minutes)

"Let's create a new experiment. I'll enter a prompt: 'Explain the benefits of regular exercise.'

Notice the example prompts below - these help users get started quickly.

Now, if I click 'Show Advanced Settings', I can configure:
- The model (GPT-3.5, GPT-4, Claude, or Mock mode)
- Temperature values - I'll test 0.3, 0.7, and 1.0
- Top P values - I'll use 0.9 and 1.0

This creates 6 different parameter combinations (3 temperatures × 2 top_p values).

[Click Generate]

While it's generating, notice the loading state with the animated spinner. The backend is now calling the LLM API for each parameter combination in parallel using async/await patterns."

## Analyzing Results (2 minutes)

"Great! The results are in. Let me explain what we're seeing:

1. **Best Response Banner**: Automatically identifies the highest-scoring response. In this case, it's Temperature 0.7 with Top P 1.0, scoring 0.842.

2. **Overall Quality Chart**: This bar chart shows the overall scores for all 6 responses. You can see how temperature affects quality - lower temperatures tend to produce higher scores.

3. **Response Selector**: I can click any parameter combination to analyze it in detail.

Let me select one. Now we see:

4. **Radar Chart**: Shows all six quality metrics visually - coherence, lexical diversity, completeness, structure, readability, and length appropriateness.

5. **Individual Metrics**: Each metric is displayed with a progress bar and exact score. Notice coherence is 0.85 and completeness is 0.90 for this response.

6. **Response Content**: The actual generated text is shown here, with word count.

Let me explain the metrics."

## Quality Metrics Explanation (2 minutes)

"These six custom metrics are the core innovation of this project. They evaluate response quality programmatically, without using another LLM.

**Coherence Score** (0.85): Measures logical flow by detecting transition words like 'however,' 'therefore,' and checking for repetitive phrases using trigram analysis.

**Lexical Diversity** (0.72): The Type-Token Ratio - ratio of unique words to total words. Higher values indicate richer vocabulary. For longer texts, I use moving-average TTR for fairer comparison.

**Completeness Score** (0.90): Checks if the response has proper ending punctuation, multiple sentences, and conclusion indicators like 'in summary.'

**Structure Score** (0.65): Evaluates paragraphs, lists, headers, and sentence length variation. Well-structured text scores higher.

**Readability Score** (0.78): A simplified Flesch Reading Ease approximation based on average words per sentence and characters per word.

**Length Appropriateness** (0.95): Scores based on word count, with an optimal range of 75-300 words.

The **Overall Score** is a weighted average, prioritizing coherence and completeness at 25% each.

All formulas and rationale are documented in the METRICS_RATIONALE.md file."

## Technical Architecture (1.5 minutes)

"Let me briefly explain the architecture:

**Frontend**:
- Next.js 15 with Server-Side Rendering
- TypeScript for type safety
- TanStack Query for state management
- Recharts for visualizations
- Responsive design with Tailwind CSS

**Backend**:
- FastAPI (Python) with async support
- SQLAlchemy ORM with SQLite database
- OpenAI and Anthropic API integration
- Custom metrics engine
- Pydantic validation

The data flow is straightforward: User submits prompt → Backend generates responses in parallel → Metrics calculated for each → Everything saved to database → Results displayed with interactive visualizations.

One key decision was using async/await throughout to enable concurrent LLM API calls, significantly improving performance."

## Export and History Features (45 seconds)

"I can export this experiment as JSON for later analysis. 

Switching to the History tab, all past experiments are saved and can be retrieved. I can view any experiment again or delete it.

The export function supports both JSON and CSV formats, making it easy to analyze data externally."

## Challenges and Solutions (1 minute)

"During development, I faced several challenges:

**Challenge 1**: Python 3.14 compatibility issues with pydantic-core.
**Solution**: Downgraded to Python 3.13 for better library support.

**Challenge 2**: Designing meaningful metrics without LLM evaluation.
**Solution**: Deep research into NLP techniques - Type-Token Ratio, coherence analysis, structural pattern detection.

**Challenge 3**: Handling multiple parameter combinations efficiently.
**Solution**: Implemented async/await patterns for concurrent generation.

**Challenge 4**: Creating a premium UI/UX.
**Solution**: Used Tailwind CSS utilities, gradient designs, smooth animations, and responsive layouts."

## What I'd Improve with More Time (30 seconds)

"Given more time, I would add:
- Side-by-side comparison mode for two responses
- Custom metric weights configurable by users
- Support for more LLM providers
- Statistical significance testing for parameter differences
- User authentication for team collaboration
- Advanced analytics with trends over time"

## Conclusion (30 seconds)

"This project demonstrates my ability to:
- Build full-stack applications with modern tech stacks
- Design programmatic evaluation systems
- Create professional, production-ready UIs
- Handle real-world challenges like API integration and async operations
- Document thoroughly and think about scalability

The application is deployed and ready to use. All source code and documentation are available in the repository.

Thank you for watching! I'm excited about the possibility of joining the GenAI-Labs team."

---

## Recording Tips

1. **Preparation**:
   - Clear browser cache
   - Close unnecessary tabs
   - Prepare a test prompt
   - Practice the flow

2. **Recording**:
   - Use screen recording software (Loom, OBS, QuickTime)
   - Record in 1080p
   - Clear audio (use external mic if possible)
   - Show mouse cursor
   - Speak clearly and enthusiastically

3. **Editing**:
   - Cut any mistakes or long pauses
   - Add captions if possible
   - Keep under 10 minutes
   - Export at high quality

4. **Upload**:
   - Upload to YouTube (unlisted)
   - Or use Loom
   - Include link in submission

## Key Points to Emphasize

- ✅ Professional, production-ready application
- ✅ Custom programmatic metrics (no LLM evaluation)
- ✅ Modern tech stack (Next.js, FastAPI, TypeScript)
- ✅ Excellent UI/UX with attention to detail
- ✅ Comprehensive documentation
- ✅ Scalable architecture
- ✅ Problem-solving skills demonstrated
- ✅ Time tracking and project management

