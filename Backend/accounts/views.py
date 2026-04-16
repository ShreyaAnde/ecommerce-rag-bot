from django.conf import settings
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

import razorpay
from groq import Groq
from transformers import pipeline

from .models import (
    FAQ, Category, Product, Order, OrderItem,
    Cart, CartItem, Review, Wishlist
)
from .models import ChatHistory
import uuid
import traceback 

from .serializers import (
    CategorySerializer,
    OrderSerializer,
    ProductSerializer,
    CartItemSerializer,
    ReviewSerializer,
    WishlistSerializer,
    FAQSerializer,
)

from .rag import get_answer, build_index

# =========================
# CLIENT INITIALIZATION
# =========================

# Groq client (USE ENV VARIABLE IN PRODUCTION)
client = Groq(api_key="your_groq_api_key_here ")

# Razorpay client
razorpay_client = razorpay.Client(
    auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
)

# NLP pipeline (load once)
generator = pipeline("text-generation", model="distilgpt2")

import logging

# Configure logging to write to a file
logging.basicConfig(
    filename="debug.log",
    level=logging.DEBUG,
    format="%(asctime)s - %(levelname)s - %(message)s"
)

logger = logging.getLogger(__name__)




import uuid

from .models import ChatHistory
from .styling_rag import get_styling_context

client = Groq(api_key="your_groq_api_key_here")


@api_view(['POST'])
def stylist_chat(request):
    try:
        query = request.data.get("question", "")
        session_id = request.data.get("session_id")

        if not session_id:
            session_id = str(uuid.uuid4())

        if not query:
            return Response({"error": "No question provided"}, status=400)

        # 🔥 Get RAG context
        context = get_styling_context(query)

        # 🔥 Prompt (VERY IMPORTANT)
        messages = [
            {
                "role": "system",
                "content": """
You are a professional fashion stylist.

Give stylish, clear, and helpful outfit advice.

Always respond in this format:

👗 Outfit:
🎨 Colors:
💍 Accessories:
👡 Footwear:
✨ Styling Tip:

Keep it concise but elegant.
"""
            },
            {
                "role": "user",
                "content": f"""
Context:
{context}

User Question:
{query}
"""
            }
        ]

        # 🔥 LLM call (UPDATED MODEL)
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=messages
        )

        answer = response.choices[0].message.content

        # 🔥 Save history
        ChatHistory.objects.create(
            session_id=session_id,
            role="user",
            message=query
        )

        ChatHistory.objects.create(
            session_id=session_id,
            role="assistant",
            message=answer
        )

        return Response({
            "answer": answer,
            "session_id": session_id
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({"error": str(e)}, status=500)
# =========================
# FAQ CHAT (RAG + AI)
# =========================
from groq import Groq
client = Groq(api_key="your_groq_api_key_here")

@api_view(['POST'])
def faq_chat(request):
    try:
        query = request.data.get("question", "")
        session_id = request.data.get("session_id")

        logger.info(f"Received query: {query}, session_id: {session_id}")

        # 🔥 create session if not exists
        if not session_id:
            session_id = str(uuid.uuid4())

        if not query:
            logger.warning("No question provided in the request.")
            return Response({"error": "No question provided"}, status=400)

        # 🔥 get previous messages (last 5)
        history = ChatHistory.objects.filter(session_id=session_id).order_by('-created_at')[:5]
        history = list(reversed(history))  # correct order

        # 🔥 format history for LLM
        messages = [
            {"role": "system", "content": "You are a helpful ecommerce assistant."}
        ]

        for chat in history:
            messages.append({
                "role": chat.role,
                "content": chat.message
            })

        # 🔥 RAG retrieval
        results = get_answer(query)
        logger.info(f"RAG results: {results}")

        context = ""
        if results:
            context = "\n\n".join([
                f"Q: {r['question']}\nA: {r['answer']}"
                for r in results
            ])

        # 🔥 add current question
        messages.append({
            "role": "user",
            "content": f"""
Context:
{context}

User Question:
{query}
"""
        })

        # 🔥 LLM call
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=messages
        )

        answer = response.choices[0].message.content
        logger.info(f"LLM response: {answer}")

        # 🔥 SAVE conversation
        ChatHistory.objects.create(
            session_id=session_id,
            role="user",
            message=query
        )

        ChatHistory.objects.create(
            session_id=session_id,
            role="assistant",
            message=answer
        )

        return Response({
            "answer": answer,
            "session_id": session_id  # send back to frontend
        })

   
    except Exception as e:
        logger.error(f"Error in faq_chat: {str(e)}")
        traceback.print_exc()   
        return Response({"error": str(e)}, status=500)
# =========================
# FAQ MANAGEMENT
# =========================
@api_view(['GET'])
def get_faqs(request):
    faqs = FAQ.objects.all()
    serializer = FAQSerializer(faqs, many=True)
    return Response(serializer.data)


@api_view(['POST'])
def add_faq(request):
    serializer = FAQSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        build_index()  # rebuild FAISS index
        return Response(serializer.data)

    return Response(serializer.errors, status=400)


# =========================
# USER REGISTER
# =========================
@api_view(['POST'])
def register_user(request):
    username = request.data.get("username")
    password = request.data.get("password")

    if User.objects.filter(username=username).exists():
        return Response({"error": "User already exists"}, status=400)

    User.objects.create_user(username=username, password=password)

    return Response({"message": "User created successfully"})


# =========================
# PRODUCTS
# =========================
@api_view(['GET'])
def get_products(request):
    products = Product.objects.all()
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def get_product_detail(request, id):
    try:
        product = Product.objects.get(id=id)
        serializer = ProductSerializer(product, context={'request': request})
        return Response(serializer.data)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=404)


@api_view(['GET'])
def products_by_category(request, slug):
    try:
        category = Category.objects.get(slug=slug)
        products = Product.objects.filter(category=category)
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)
    except Category.DoesNotExist:
        return Response({"error": "Category not found"}, status=404)


# =========================
# CART
# =========================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_cart(request):
    cart, _ = Cart.objects.get_or_create(user=request.user)
    items = CartItem.objects.filter(cart=cart)

    serializer = CartItemSerializer(items, many=True)
    return Response({'cart': serializer.data})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_cart(request):
    product_id = request.data.get('product_id')

    if not product_id:
        return Response({"error": "product_id is required"}, status=400)

    product = get_object_or_404(Product, id=product_id)
    cart, _ = Cart.objects.get_or_create(user=request.user)

    item, created = CartItem.objects.get_or_create(
        cart=cart,
        product=product
    )

    if not created:
        item.quantity += 1
        item.save()

    items = CartItem.objects.filter(cart=cart)
    serializer = CartItemSerializer(items, many=True)

    return Response({
        "message": "Product added to cart",
        "cart": serializer.data
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def remove_from_cart(request):
    item_id = request.data.get('item_id')
    CartItem.objects.filter(id=item_id).delete()
    return Response({'message': 'Item removed'})


# =========================
# WISHLIST
# =========================
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_to_wishlist(request):
    product_id = request.data.get("product")

    if not product_id:
        return Response({"error": "Product id missing"}, status=400)

    product = get_object_or_404(Product, id=int(product_id))

    wishlist, _ = Wishlist.objects.get_or_create(
        user=request.user,
        product=product
    )

    serializer = WishlistSerializer(wishlist)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_wishlist(request):
    wishlist = Wishlist.objects.filter(user=request.user)
    serializer = WishlistSerializer(wishlist, many=True)
    return Response(serializer.data)


# =========================
# REVIEWS (FIXED SINGLE VERSION)
# =========================
@api_view(["POST"])
def add_review(request):
    serializer = ReviewSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)

    return Response(serializer.errors, status=400)


@api_view(['GET'])
def get_reviews(request, product_id):
    reviews = Review.objects.filter(product_id=product_id)
    serializer = ReviewSerializer(reviews, many=True)
    return Response(serializer.data)


# =========================
# ORDERS + PAYMENT
# =========================
@api_view(['POST'])
def create_order(request):
    items = request.data.get('items', [])

    if not items:
        return Response({"error": "Cart is empty"}, status=400)

    try:
        total_amount = 0

        for item in items:
            product = get_object_or_404(Product, id=item['product'])
            total_amount += product.price * item['quantity']

        amount_in_paise = int(total_amount * 100)

        razorpay_order = razorpay_client.order.create({
            "amount": amount_in_paise,
            "currency": "INR",
            "payment_capture": 1
        })

        return Response({
            "razorpay_order_id": razorpay_order['id'],
            "amount": razorpay_order['amount']
        })

    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_payment(request):
    try:
        params = {
            'razorpay_order_id': request.data['razorpay_order_id'],
            'razorpay_payment_id': request.data['razorpay_payment_id'],
            'razorpay_signature': request.data['razorpay_signature']
        }

        razorpay_client.utility.verify_payment_signature(params)

        order = Order.objects.create(
            user=request.user,
            address=request.data.get("address"),
            payment_method="UPI",
            payment_status="Paid",
            order_status="Placed"
        )

        return Response({
            "message": "Payment verified",
            "order_id": order.id
        })

    except Exception as e:
        return Response({"error": str(e)}, status=400)


# =========================
# ORDER TRACKING
# =========================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def track_order(request, order_id):
    try:
        order = Order.objects.get(id=order_id, user=request.user)

        items = order.items.all()
        item_list = [
            {
                "product": item.product.name,
                "quantity": item.quantity,
                "price": item.price
            }
            for item in items
        ]

        return Response({
            "id": order.id,
            "address": order.address,
            "payment_method": order.payment_method,
            "payment_status": order.payment_status,
            "order_status": order.order_status,
            "total_price": order.total_price,
            "items": item_list,
            "created_at": order.created_at
        })

    except Order.DoesNotExist:
        return Response({"error": "Order not found"}, status=404)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_orders(request):
    orders = Order.objects.filter(user=request.user).order_by('-created_at')
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)