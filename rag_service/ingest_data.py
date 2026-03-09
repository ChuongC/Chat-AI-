
from datetime import datetime, timezone
from dotenv import load_dotenv
from langchain.schema import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_postgres import PGVector
from helpers import (
    fetch_and_extract, 
    get_urls_from_sitemap)
import os
load_dotenv()

# Get all needed site
sitemap_url = "https://docs.frappe.io/sitemap.xml"
urls = get_urls_from_sitemap(sitemap_url)
#Add url
urls.append("https://docs.frappe.io/crm/introduction/installation")

documents = []

for url in urls:
    content, title = fetch_and_extract(url)
    documents.append(
        Document(
            page_content=content,
            metadata={
                "source": url,
                "section_title": title if title else "Untitled",
                "ingestion_timestamp": datetime.now(timezone.utc).isoformat()
            }
        )
    )

# chunking
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200
)

chunks = text_splitter.split_documents(documents)
# chunk = chunk_by_headers

print(f"Total chunks created: {len(chunks)}")


# embedding model
embeddings_model = OpenAIEmbeddings(
    model="text-embedding-3-small",
    base_url="https://llm.ptnglobalcorp.com"
)

collection_name = "frappe_docs"

vector_store = PGVector(
    embeddings=embeddings_model,
    collection_name=collection_name,
    connection=os.getenv("DB_CONNECTION"),
    use_jsonb=True,  # to filter metadata
)

vector_store.add_documents(chunks)

print("PGVector DB created successfully.")
