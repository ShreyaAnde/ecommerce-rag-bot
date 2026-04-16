import json
import os
import numpy as np
import faiss

model = None
index = None
documents = []

# -----------------------
# LOAD MODEL (lazy)
# -----------------------
def get_model():
    global model
    if model is None:
        from sentence_transformers import SentenceTransformer
        print("🔄 Loading model...")
        model = SentenceTransformer('all-MiniLM-L6-v2')
        print("✅ Model loaded")
    return model


# -----------------------
# LOAD JSON + PREP DOCS
# -----------------------
def load_fashion_data():
    global documents

    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(BASE_DIR, "data", "fashion_knowledge.json")

    with open(file_path, "r") as f:
        data = json.load(f)

    docs = []

    for event in data["events"]:
        text = f"""
Event: {event['name']}
Outfits: {', '.join(event['outfits'])}
Colors: {', '.join(event['colors'])}
Fabrics: {', '.join(event['fabrics'])}
Accessories: {', '.join(event['accessories'])}
Footwear: {', '.join(event['footwear'])}
Styles: {', '.join(event['styles'])}
Tips: {', '.join(event['tips'])}
"""
        docs.append(text)

    documents = docs


# -----------------------
# BUILD FAISS INDEX
# -----------------------
def build_styling_index():
    global index, documents

    load_fashion_data()

    model = get_model()
    embeddings = model.encode(documents)

    embeddings = np.array(embeddings).astype("float32")

    # normalize for cosine similarity
    faiss.normalize_L2(embeddings)

    dimension = embeddings.shape[1]

    index = faiss.IndexFlatIP(dimension)
    index.add(embeddings)

    print("✅ Styling FAISS index built")


# -----------------------
# RETRIEVE CONTEXT
# -----------------------
def get_styling_context(query, k=2):
    global index, documents

    if index is None:
        build_styling_index()

    model = get_model()

    query_embedding = model.encode([query])
    query_embedding = np.array(query_embedding).astype("float32")

    faiss.normalize_L2(query_embedding)

    D, I = index.search(query_embedding, k)

    results = []

    for i in I[0]:
        if i < len(documents):
            results.append(documents[i])

    return "\n\n".join(results)