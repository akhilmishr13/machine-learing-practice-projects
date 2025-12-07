# Understanding the Dallas Student Navigator Application

This guide explains the code and architecture for beginners who are new to Python and the technologies used.

## Table of Contents
1. [What Does This Application Do?](#what-does-this-application-do)
2. [Technologies Used (Simple Explanation)](#technologies-used-simple-explanation)
3. [High-Level Architecture](#high-level-architecture)
4. [How It Works - Step by Step](#how-it-works---step-by-step)
5. [Code Structure Explained](#code-structure-explained)
6. [Key Concepts](#key-concepts)

---

## What Does This Application Do?

Imagine you're an international student arriving in Dallas, Texas. You have many questions:
- "Where can I find affordable housing?"
- "What are the best grocery stores?"
- "How do I use public transportation?"
- "What are the visa requirements?"

Instead of searching Google multiple times and reading through many websites, you can:
1. **Ask questions** in natural language through a chat interface
2. The system **searches the web** for current, relevant information
3. It **synthesizes the results** using AI to create a comprehensive answer
4. It **provides sources** so you can verify the information

This is called a **Web Search Agent**:
- **Web Search**: Finds real-time information from the internet
- **AI Synthesis**: Combines multiple sources into a coherent answer
- **Context-Aware**: Understands conversation history and student needs

---

## Technologies Used (Simple Explanation)

### 1. **Python** 🐍
- The programming language we use
- Like a recipe book that tells the computer what to do

### 2. **Streamlit** 🎨
- A library to create web interfaces quickly
- **Why we use it**: No need to write HTML/CSS/JavaScript - just Python code!
- Creates beautiful, interactive web apps with minimal code

### 3. **LangChain** 🔗
- A framework that helps chain together AI operations
- **Why we use it**: Makes it easy to:
  - Connect to AI models (Azure OpenAI)
  - Use web search tools
  - Manage conversations
  - Build complex AI workflows

### 4. **Azure OpenAI** 🤖
- GPT models (like ChatGPT) that generate text
- **Why we use it**: To create intelligent, conversational responses
- Uses Azure's cloud infrastructure for reliable AI access

### 5. **DuckDuckGo Search** 🔍
- A privacy-focused search engine
- **Why we use it**: To find real-time, current information from the web
- Provides search results without tracking users

### 6. **Environment Variables (.env)** 🔐
- Secure way to store API keys and configuration
- **Why we use it**: Keeps sensitive information out of code
- Loaded using `python-dotenv` library

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    USER (Student)                            │
│              Types a question in the web UI                   │
│         Example: "Where can I find housing in Dallas?"        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│         Streamlit Frontend (app.py)                         │
│         - Web interface (chat UI)                            │
│         - Login page                                         │
│         - Sidebar with quick links                           │
│         - Displays messages and responses                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│         Web Search Agent (langchain_module.py)              │
│         Step 1: Validate query (is it relevant?)            │
│         Step 2: Enhance query with context                  │
│         Step 3: Search the web (DuckDuckGo)                  │
│         Step 4: Synthesize answer with Azure OpenAI          │
│         Step 5: Extract and format sources                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
        ▼                             ▼
┌──────────────┐            ┌──────────────────┐
│ DuckDuckGo   │            │  Azure OpenAI    │
│ Search       │            │  (GPT Model)     │
│              │            │                  │
│ Finds        │            │ Synthesizes      │
│ current web  │            │ search results   │
│ information  │            │ into answers     │
└──────────────┘            └──────────────────┘
```

---

## How It Works - Step by Step

### Step 1: User Opens the Application

**User visits**: `http://localhost:8501`

**Streamlit** (`app.py`):
```python
# Shows login page first
if not st.session_state.logged_in:
    show_login()  # Displays login form
```

**User logs in**:
- Email: `titan@utdallas.com`
- Password: `password`

### Step 2: User Asks a Question

**User types**: "Where can I find affordable housing near UT Dallas?"

**Streamlit** (`app.py`):
```python
# User input triggers this
if prompt := st.chat_input("Ask me anything about living in Dallas..."):
    # Adds message to chat history
    st.session_state.messages.append({"role": "user", "content": prompt})
    
    # Gets response from agent
    response = get_response(prompt, st.session_state.messages)
```

### Step 3: Query Validation

**WebSearchAgent** (`langchain_module.py`):
```python
# Checks if query is relevant to student topics
validation = self.validator.is_relevant_query(query)

# Checks for keywords like:
# - "housing", "apartment", "rent" → Housing category
# - "student", "international", "dallas" → Student context
# - Question words: "where", "how", "what" → Relevant format
```

**Result**: Query is relevant ✓ (matches "Housing" category)

### Step 4: Enhance Query with Context

**WebSearchAgent** (`langchain_module.py`):
```python
# Adds context to improve search results
search_query = f"international students Dallas Texas {enhanced_query}"
# Result: "international students Dallas Texas Where can I find affordable housing near UT Dallas?"
```

**Why?**: 
- Makes search more specific
- Finds results relevant to international students
- Focuses on Dallas area

### Step 5: Web Search

**DuckDuckGo Search**:
```python
search_results = self.search.run(search_query)
# Returns: Text snippets from multiple websites about housing in Dallas
```

**What it finds**:
- Apartment listings near UT Dallas
- Student housing resources
- Rental websites
- University housing information

### Step 6: AI Synthesis

**Azure OpenAI** (`langchain_module.py`):
```python
# Builds a prompt with:
# - System instructions (be helpful for students)
# - Search results (raw web data)
# - User's question
# - Conversation history (if any)

prompt = f"""You are a helpful assistant for international students...
Search Results: {search_results}
User Question: {query}
Provide a helpful answer..."""

# Sends to Azure OpenAI
response = self.llm.invoke(messages_langchain)
```

**What happens**:
- AI reads all search results
- Combines information from multiple sources
- Creates a coherent, helpful answer
- Adds inline citations [1], [2], etc.

### Step 7: Extract Sources

**WebSearchAgent** (`langchain_module.py`):
```python
# Finds URLs in search results
sources = self._extract_sources(search_results)
# Returns: ["https://utdallas.edu/housing", "https://apartments.com/...", ...]

# Adds to response
generated_text += "\n\n**References:**\n"
for idx, source in enumerate(sources, 1):
    generated_text += f"[{idx}] [{link_display}]({source})\n"
```

### Step 8: Display Response

**Streamlit** (`app.py`):
```python
# Processes links to open in new tabs
processed_response = process_links_for_new_tab(response)

# Displays in chat interface
st.markdown(processed_response, unsafe_allow_html=True)
```

**User sees**:
- A comprehensive answer about housing options
- Inline citations [1], [2] in the text
- Reference links at the bottom
- All links open in new tabs when clicked

---

## Code Structure Explained

### File: `app.py`

**Purpose**: The web interface that users interact with

**Key Components**:

1. **Login System**
   ```python
   def show_login():
       # Displays login form
       # Checks credentials
       # Sets logged_in state
   ```
   **Simple Explanation**: Like a door to your house - checks if you're allowed in

2. **Session State**
   ```python
   if "messages" not in st.session_state:
       st.session_state.messages = []  # Stores chat history
   ```
   **Simple Explanation**: Like a memory - remembers your conversation

3. **Chat Interface**
   ```python
   # Displays messages
   for message in st.session_state.messages:
       with st.chat_message(message["role"]):
           st.markdown(message["content"])
   
   # Handles new input
   if prompt := st.chat_input("Ask me anything..."):
       response = get_response(prompt, st.session_state.messages)
   ```
   **Simple Explanation**: Like a messaging app - shows old messages and handles new ones

4. **Quick Links Sidebar**
   ```python
   if st.button("🏠 Housing"):
       st.session_state.quick_prompt = "Where can I find affordable housing..."
   ```
   **Simple Explanation**: Like preset buttons - one click to ask common questions

**Simple Explanation**:
- Like a **web page** that:
  - Shows a login screen first
  - Displays a chat interface
  - Has helpful buttons for common questions
  - Remembers your conversation

### File: `langchain_module.py`

**Purpose**: The brain of the application - handles search and AI responses

**Key Components**:

1. **StudentQueryValidator**
   ```python
   class StudentQueryValidator:
       CATEGORY_KEYWORDS = {
           "Housing": ["apartment", "housing", "rent", ...],
           "Groceries": ["grocery", "food", "market", ...],
           ...
       }
       
       def is_relevant_query(self, query):
           # Checks if query matches student topics
           # Returns: is_relevant, matched_categories
   ```
   **Simple Explanation**: Like a filter - only allows questions about student topics

2. **WebSearchAgent**
   ```python
   class WebSearchAgent:
       def __init__(self):
           self.search = DuckDuckGoSearchRun()  # Web search tool
           self.validator = StudentQueryValidator()  # Query validator
           self.llm = AzureChatOpenAI(...)  # AI model
       
       def search_and_respond(self, query, conversation_history):
           # 1. Validate query
           # 2. Search web
           # 3. Synthesize with AI
           # 4. Return answer
   ```
   **Simple Explanation**: Like a **smart research assistant** that:
     - Checks if your question makes sense
     - Searches the internet for you
     - Reads multiple sources
     - Writes a helpful summary
     - Cites sources

3. **Query Enhancement**
   ```python
   def _build_standalone_query(self, query, conversation_history):
       # Adds context from previous messages
       # "Where is it?" → "Where is the apartment near UT Dallas?"
   ```
   **Simple Explanation**: Like adding context - makes vague questions clear

4. **Source Extraction**
   ```python
   def _extract_sources(self, search_results):
       # Finds URLs in search results
       # Returns list of source links
   ```
   **Simple Explanation**: Like collecting references - finds where information came from

**Simple Explanation**:
- Like a **research librarian** that:
  - Understands what you're asking
  - Searches multiple sources
  - Combines information intelligently
  - Gives you sources to verify

---

## Key Concepts

### 1. **Web Search vs. Document Search**

**Document Search (RAG)**:
```
Question → Search your own documents → Find relevant parts → Answer
```
- Uses your own documents (PDFs, files)
- Fast, but limited to what you have
- Good for: Company knowledge, books, manuals

**Web Search (This App)**:
```
Question → Search the internet → Find current information → Synthesize → Answer
```
- Uses the entire internet
- Always up-to-date
- Good for: Current events, locations, real-time info

### 2. **Query Validation**

**Why?**
- Prevents irrelevant questions (like "What's the weather?")
- Ensures answers are helpful for students
- Categorizes questions for better responses

**How it works**:
```python
# Checks for keywords
"Housing" category: ["apartment", "housing", "rent", ...]
"Legal Info" category: ["visa", "work permit", "f1", ...]

# If query matches → Relevant ✓
# If query doesn't match → Shows helpful message
```

### 3. **AI Synthesis**

**Problem**: Web search returns raw, unorganized information

**Solution**: AI synthesis
```
Raw Search Results:
- "UT Dallas has on-campus housing..."
- "Apartments.com lists 50+ options..."
- "Student housing near campus..."

AI Synthesis:
→ "There are several housing options for students near UT Dallas:
   1. On-campus housing (managed by university)
   2. Off-campus apartments (many options on Apartments.com)
   3. Student-specific housing communities..."
```

**Benefits**:
- Combines multiple sources
- Removes duplicates
- Creates coherent narrative
- Focuses on student needs

### 4. **Conversation Context**

**How it works**:
- Stores last 4 messages (2 exchanges)
- Used for:
  - Understanding "it", "that", "this"
  - Building standalone queries
  - Creating context-aware answers

**Example**:
```
User: "Where can I find housing?"
Bot: "Here are housing options..."
User: "How much does it cost?"  ← "it" refers to housing
Bot: [Uses context to understand "it" = housing]
```

### 5. **Source Citations**

**Why cite sources?**
- Users can verify information
- Builds trust
- Shows where information came from

**How it works**:
```python
# AI adds inline citations
"UT Dallas offers on-campus housing [1]..."

# Sources listed at bottom
**References:**
[1] https://utdallas.edu/housing
[2] https://apartments.com/...
```

---

## Data Flow Example

Let's trace a complete example:

### User Input: "Where can I find affordable housing near UT Dallas?"

1. **Streamlit receives input**
   ```python
   prompt = "Where can I find affordable housing near UT Dallas?"
   ```

2. **Sends to WebSearchAgent**
   ```python
   response = get_response(prompt, st.session_state.messages)
   ```

3. **Query validation**
   ```python
   validation = validator.is_relevant_query(prompt)
   # Result: is_relevant=True, matched_categories=["Housing"]
   ```

4. **Enhance query**
   ```python
   search_query = "international students Dallas Texas Where can I find affordable housing near UT Dallas?"
   ```

5. **Web search**
   ```python
   search_results = duckduckgo_search.run(search_query)
   # Returns: Multiple text snippets about housing in Dallas
   ```

6. **AI synthesis**
   ```python
   # Builds prompt with:
   # - System: "You are a helpful assistant for students..."
   # - Search results: Raw web data
   # - Question: User's question
   # → Sends to Azure OpenAI
   # → Gets synthesized answer
   ```

7. **Extract sources**
   ```python
   sources = extract_urls(search_results)
   # Returns: ["https://utdallas.edu/housing", ...]
   ```

8. **Format response**
   ```python
   answer = synthesized_text + "\n\n**References:**\n" + formatted_sources
   ```

9. **Display in UI**
   ```python
   # Shows answer with clickable links
   # Links open in new tabs
   ```

---

## Important Python Concepts Used

### 1. **Session State (Streamlit)**

```python
if "messages" not in st.session_state:
    st.session_state.messages = []
```

**Simple Explanation**: 
- Like a memory that persists across interactions
- Remembers your conversation even when the page refreshes
- Streamlit-specific feature

### 2. **Decorators**

```python
@st.cache_resource
def get_agent():
    return get_web_search_agent()
```

**Simple Explanation**:
- `@st.cache_resource` = Cache this function
- First call: Creates agent (slow)
- Subsequent calls: Returns cached agent (fast)
- Like saving something so you don't have to recreate it

### 3. **Environment Variables**

```python
from dotenv import load_dotenv
load_dotenv()

azure_endpoint = os.getenv('AZURE_OPENAI_ENDPOINT')
```

**Simple Explanation**:
- Secure way to store API keys
- Not hardcoded in the program
- Loaded from `.env` file
- Like a secret password file

### 4. **Regular Expressions (Regex)**

```python
url_pattern = r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+'
urls = re.findall(url_pattern, search_results)
```

**Simple Explanation**:
- Pattern matching for text
- Finds URLs in search results
- Like a smart "find" tool

### 5. **Singleton Pattern**

```python
_web_search_agent = None

def get_web_search_agent():
    global _web_search_agent
    if _web_search_agent is None:
        _web_search_agent = WebSearchAgent()
    return _web_search_agent
```

**Simple Explanation**:
- Ensures only one agent instance exists
- First call: Creates agent
- Subsequent calls: Returns same agent
- Like having one phone - everyone shares it

---

## Common Questions

### Q: Why use web search instead of a knowledge base?

**A**: 
- **Web search**: Always current, covers everything on the internet
- **Knowledge base**: Limited to what you've stored, may be outdated
- For student questions about locations, current events, etc., web search is better

### Q: Why validate queries?

**A**:
- Prevents answering irrelevant questions
- Ensures focus on student topics
- Provides helpful guidance if query is off-topic

### Q: How does it know what's relevant?

**A**:
- Checks for keywords in predefined categories
- Looks for student-related terms
- Checks for question format
- Very permissive - allows most legitimate questions

### Q: Why synthesize with AI instead of just showing search results?

**A**:
- **Raw search results**: Unorganized, duplicates, hard to read
- **AI synthesis**: Organized, coherent, focused on student needs
- Like the difference between raw notes and a well-written summary

### Q: What if Azure OpenAI is unavailable?

**A**:
- Falls back to showing raw search results
- Still provides information, just not as polished
- Error handling ensures the app doesn't crash

### Q: How does conversation history work?

**A**:
- Stores last 4 messages (2 exchanges)
- Used to understand context ("it", "that")
- Helps build better standalone queries
- Kept minimal to avoid token limits

---

## Tips for Understanding the Code

1. **Start with `app.py`** - It's the entry point and shows the UI flow
2. **Follow a question** - Trace how a question flows through the system
3. **Read comments** - They explain what each part does
4. **Test with print statements** - Add `print()` to see what's happening
5. **Try different questions** - See how validation and search work

---

## Differences from RAG Application (Folder 1)

| Feature | Folder 1 (RAG) | Folder 2 (Web Search) |
|---------|----------------|----------------------|
| **Data Source** | Your own documents (PDFs) | The entire internet |
| **Search Method** | Vector similarity (embeddings) | Web search (DuckDuckGo) |
| **Information** | Static (from documents) | Dynamic (always current) |
| **Use Case** | Answer questions about your documents | Answer questions about anything |
| **Setup** | Need to process documents first | Works immediately |
| **Storage** | FAISS vector database | No storage needed |

---

## Next Steps

1. **Read the code** with this guide open
2. **Run the application** and try different questions
3. **Modify categories** - Add new categories in `StudentQueryValidator`
4. **Change prompts** - Modify system prompts for different responses
5. **Add features** - Consider adding:
   - Saved conversations
   - Favorite questions
   - Multi-language support

---

## Summary

This application:
1. **Provides a web interface** for students to ask questions
2. **Validates queries** to ensure they're relevant
3. **Searches the web** for current information
4. **Synthesizes results** using Azure OpenAI
5. **Returns answers** with source citations
6. **Maintains conversation** context for better responses

The magic is in combining:
- **Web search** (finding current information)
- **AI synthesis** (creating helpful answers)
- **Query validation** (ensuring relevance)
- **Conversation memory** (understanding context)

This creates a system that can answer questions about living in Dallas intelligently and helpfully!

---

## Environment Setup

### Required Environment Variables

Create a `.env` file with:

```env
# Azure OpenAI Configuration
AZURE_OPENAI_ENDPOINT=https://your-endpoint.openai.azure.com/
AZURE_OPENAI_API_KEY=your_api_key_here
AZURE_OPENAI_API_VERSION=2024-12-01-preview
AZURE_OPENAI_MODEL=gpt-4o
```

### Running the Application

```bash
# Activate virtual environment
source ../venv/bin/activate

# Run Streamlit app
streamlit run app.py

# Or use the run script
./run_app.sh
```

The app will be available at `http://localhost:8501`

---

Built with ❤️ for international students in Dallas

