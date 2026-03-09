from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from chat_rag import create_rag_chain
import uvicorn

app = FastAPI(title="Frappe CRM RAG Service")

# Build once at startup
rag = create_rag_chain()

class QueryRequest(BaseModel):
    question: str

class QueryResponse(BaseModel):
    answer: str

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/rag", response_model=QueryResponse)
async def query_rag(request: QueryRequest):
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Question required")
    try:
        answer = rag(request.question)
        return QueryResponse(answer=answer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)