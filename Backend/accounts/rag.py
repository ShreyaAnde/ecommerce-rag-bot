import numpy as np
import faiss

# -----------------------
# GLOBALS
# -----------------------
model = None
faq_texts = []
faq_answers = []
index = None


# -----------------------
# LAZY LOAD MODEL
# -----------------------
def get_model():
    global model
    if model is None:
        from sentence_transformers import SentenceTransformer
        print("🔄 Loading SentenceTransformer model...")
        model = SentenceTransformer('all-MiniLM-L6-v2')
        print("✅ Model loaded")
    return model


# -----------------------
# BUILD FAISS INDEX
# -----------------------
def build_index():
    global faq_texts, faq_answers, index

    from .models import FAQ

    faqs = FAQ.objects.all()

    if not faqs.exists():
        index = None
        return

    faq_texts = [faq.question for faq in faqs]
    faq_answers = [faq.answer for faq in faqs]

    model = get_model()

    embeddings = model.encode(faq_texts)

    # ✅ FIX 1: convert to float32 (VERY IMPORTANT for FAISS)
    embeddings = np.array(embeddings).astype("float32")

    # ✅ OPTIONAL FIX: normalize vectors (better similarity search)
    faiss.normalize_L2(embeddings)

    dimension = embeddings.shape[1]

    # ✅ Using cosine similarity via Inner Product index
    index = faiss.IndexFlatIP(dimension)
    index.add(embeddings)


# -----------------------
# GET BEST ANSWER
# -----------------------
def get_answer(query):
    global index

    if index is None:
        build_index()

    if index is None:
        return None

    model = get_model()

    query_embedding = model.encode([query])
    query_embedding = np.array(query_embedding).astype("float32")
    faiss.normalize_L2(query_embedding)

    # 🔥 change k=1 → k=3
    D, I = index.search(query_embedding, k=3)

    results = []
    for idx, score in zip(I[0], D[0]):
        if score > 0.5:
            results.append({
                "question": faq_texts[idx],
                "answer": faq_answers[idx]
            })

    return results if results else None