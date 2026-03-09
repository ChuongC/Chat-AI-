from dotenv import load_dotenv

from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_postgres import PGVector
from langchain.prompts import ChatPromptTemplate
from langchain.schema import StrOutputParser
import os
load_dotenv()


def load_vectorstore():
    embeddings = OpenAIEmbeddings(
        model="text-embedding-3-small",
        base_url="https://llm.ptnglobalcorp.com"
    )

    COLLECTION_NAME = "frappe_docs"

    db = PGVector(
        embeddings=embeddings,
        collection_name=COLLECTION_NAME,
        connection=os.getenv("DB_CONNECTION"),
        use_jsonb=True,
    )

    return db


def create_rag_chain():

    db = load_vectorstore()

    retriever = db.as_retriever(
        search_type="similarity",
        search_kwargs={"k": 4}
    )

    llm = ChatOpenAI(
        model="gpt-4.1",
        base_url="https://llm.ptnglobalcorp.com",
        temperature=0.1
    )

    prompt = ChatPromptTemplate.from_template(
    """
    You are a helpful assistant. Use the following context in your response:

    Context:
    {context}

    Question:
    {question}
    Restrictly use special characters from context, use language to describe.
    Answer clearly and concisely.
    """)

    def rag_pipeline(question: str):

        docs = retriever.invoke(question)

        context_text = "\n\n".join(
            [doc.page_content for doc in docs]
        )

        chain = prompt | llm | StrOutputParser()

        response = chain.invoke({
            "context": context_text,
            "question": question
        })

        return response

    return rag_pipeline


if __name__ == "__main__":

    rag = create_rag_chain()

    print("CRM RAG Chatbot Ready 🚀")
    print("Type 'exit' to quit.\n")

    while True:
        query = input("You: ")

        if query.lower() == "exit":
            break

        answer = rag(query)

        print("\nAssistant:", answer)
        print("-" * 50)