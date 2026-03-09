# Create virtual environment

uv venv

## Window

## Macos

source .venv/bin/activate

# Install dependencies

uv pip install -r requirements.txt

# Run docker

docker run -d \
 --name pgvector \
 -e POSTGRES_PASSWORD=postgres \
 -e POSTGRES_DB=rag_db \
 -p 5433:5432 \
 pgvector/pgvector:pg16

# Create file .env in project

.env file:
OPENAI_API_KEY="your-api-key"
USER_AGENT = "MyRAGBot/1.0"
DB_CONNECTION = "postgresql+psycopg2://postgres:postgres@localhost:5433/rag_db"

# Run file

Run file ingest_data.py so as to ingest guide data into pgvecto
Run file chat_rag.py to start chatbot
