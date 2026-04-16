from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [

    # Authentication
    path('register/', views.register_user),
    path('login/', TokenObtainPairView.as_view()),
    path('token/refresh/', TokenRefreshView.as_view()),

    # Products
    path('products/', views.get_products),
    path('products/<int:id>/', views.get_product_detail),

    # Cart
    path('cart/', views.get_cart),
    path('cart/add/', views.add_to_cart),
    path('cart/remove/', views.remove_from_cart),

    # Wishlist
    path('wishlist/', views.get_wishlist),
    path('wishlist/add/', views.add_to_wishlist),

  
     # Orders
     path('My_orders/', views.my_orders),
    path('create_order/', views.create_order),
   path("track_order/<int:order_id>/", views.track_order),
    path('my_orders/', views.my_orders),

    # Reviews
    path('review/add/', views.add_review),

    # urls.py

path('products/category/<slug:slug>/', views.products_by_category),
# urls.py

path('reviews/add/', views.add_review),
path('reviews/<int:product_id>/', views.get_reviews),
path('verify_payment/', views.verify_payment),
path('faqs/', views.get_faqs),
path('add/', views.add_faq),
path('faq-chat/', views.faq_chat),
# urls.py

path('stylist-chat/', views.stylist_chat),


]