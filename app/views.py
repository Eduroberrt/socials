from django.shortcuts import render

# Create your views here.

def index(request):
    """Serve the React frontend application"""
    return render(request, "frontend/index.html")

def frontend_app(request):
    """Catch-all view for React Router paths"""
    return render(request, "frontend/index.html")
