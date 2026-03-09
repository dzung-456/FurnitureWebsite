from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
import httpx
from app.core.config import settings
from app.db.base import get_db
from app.models.user_model import User
from app.core.security import create_access_token
from datetime import datetime
import uuid
import urllib.parse

router = APIRouter()

@router.get("/auth/github/login")
async def github_login():
    return RedirectResponse(
        f"https://github.com/login/oauth/authorize?client_id={settings.GITHUB_CLIENT_ID}&scope=user:email&redirect_uri=http://localhost:8000/api/auth/github/callback"
    )

@router.get("/auth/github/callback")
async def github_callback(code: str, db: Session = Depends(get_db)):
    async with httpx.AsyncClient() as client:
        # Exchange code for token
        response = await client.post(
            "https://github.com/login/oauth/access_token",
            headers={"Accept": "application/json"},
            data={
                "client_id": settings.GITHUB_CLIENT_ID,
                "client_secret": settings.GITHUB_CLIENT_SECRET,
                "code": code,
            },
        )
        data = response.json()
        if "error" in data:
            raise HTTPException(status_code=400, detail=data.get("error_description"))
        
        access_token = data["access_token"]
        
        # Get user info
        user_response = await client.get(
            "https://api.github.com/user",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        user_data = user_response.json()
        
        # Get user email
        email_response = await client.get(
            "https://api.github.com/user/emails",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        emails = email_response.json()
        primary_email = next((e["email"] for e in emails if e["primary"]), None)
        
    if not primary_email:
         # Fallback if no primary email found (unlikely)
         primary_email = f"{user_data['login']}@github.com"

    # Check if user exists
    user = db.query(User).filter(User.email == primary_email).first()
    if not user:
        # Create new user
        now = datetime.utcnow()
        user = User(
            username=user_data["login"], # Potential conflict, might need unique check
            email=primary_email,
            full_name=user_data.get("name") or user_data["login"],
            password_hash=uuid.uuid4().hex, # Random password
            role="customer",
            created_at=now,
            updated_at=now,
            status="active",
            avatar=user_data.get("avatar_url")
        )
        # Handle username conflict
        if db.query(User).filter(User.username == user.username).first():
            user.username = f"{user.username}_{uuid.uuid4().hex[:4]}"
            
        db.add(user)
        db.commit()
        db.refresh(user)
        
    # Create JWT
    token = create_access_token(user.id)
    
    # Redirect to frontend
    return RedirectResponse(f"http://localhost:5173/login?token={token}")

@router.get("/auth/facebook/login")
async def facebook_login():
    return RedirectResponse(
        f"https://www.facebook.com/v12.0/dialog/oauth?client_id={settings.FACEBOOK_CLIENT_ID}&redirect_uri=http://localhost:8000/api/auth/facebook/callback&scope=email"
    )

@router.get("/auth/facebook/callback")
async def facebook_callback(code: str, db: Session = Depends(get_db)):
    async with httpx.AsyncClient() as client:
        # Exchange code for token
        response = await client.get(
            "https://graph.facebook.com/v12.0/oauth/access_token",
            params={
                "client_id": settings.FACEBOOK_CLIENT_ID,
                "client_secret": settings.FACEBOOK_CLIENT_SECRET,
                "redirect_uri": "http://localhost:8000/api/auth/facebook/callback",
                "code": code,
            },
        )
        data = response.json()
        if "error" in data:
            raise HTTPException(status_code=400, detail=data["error"]["message"])
            
        access_token = data["access_token"]
        
        # Get user info
        user_response = await client.get(
            "https://graph.facebook.com/me",
            params={
                "fields": "id,name,email,picture",
                "access_token": access_token
            }
        )
        user_data = user_response.json()
        
    email = user_data.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Email not provided by Facebook")
        
    # Check if user exists
    user = db.query(User).filter(User.email == email).first()
    if not user:
        # Create new user
        now = datetime.utcnow()
        username = user_data["name"].replace(" ", "").lower()
        
        user = User(
            username=username,
            email=email,
            full_name=user_data["name"],
            password_hash=uuid.uuid4().hex,
            role="customer",
            created_at=now,
            updated_at=now,
            status="active",
            avatar=user_data["picture"]["data"]["url"] if "picture" in user_data else None
        )
         # Handle username conflict
        while db.query(User).filter(User.username == user.username).first():
             user.username = f"{username}_{uuid.uuid4().hex[:4]}"
             
        db.add(user)
        db.commit()
        db.refresh(user)
        
    # Create JWT
    token = create_access_token(user.id)
    
    # Redirect to frontend
    return RedirectResponse(f"http://localhost:5173/login?token={token}")


@router.get("/auth/google/login")
async def google_login():
    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": "http://localhost:8000/api/auth/google/callback",
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "consent"
    }
    url = f"https://accounts.google.com/o/oauth2/v2/auth?{urllib.parse.urlencode(params)}"
    return RedirectResponse(url)

@router.get("/auth/google/callback")
async def google_callback(code: str, db: Session = Depends(get_db)):
    async with httpx.AsyncClient() as client:
        # Exchange code for token
        response = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": code,
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "redirect_uri": "http://localhost:8000/api/auth/google/callback",
                "grant_type": "authorization_code"
            },
        )
        data = response.json()
        if "error" in data:
            raise HTTPException(status_code=400, detail=data["error_description"])
        
        access_token = data["access_token"]
        
        # Get user info
        user_response = await client.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        user_data = user_response.json()
        
    email = user_data.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Email not provided by Google")
        
    # Check if user exists
    user = db.query(User).filter(User.email == email).first()
    if not user:
        # Create new user
        now = datetime.utcnow()
        username = user_data["email"].split("@")[0]
        
        user = User(
            username=username,
            email=email,
            full_name=user_data.get("name", username),
            password_hash=uuid.uuid4().hex,
            role="customer",
            created_at=now,
            updated_at=now,
            status="active",
            avatar=user_data.get("picture")
        )
         # Handle username conflict
        while db.query(User).filter(User.username == user.username).first():
             user.username = f"{username}_{uuid.uuid4().hex[:4]}"
             
        db.add(user)
        db.commit()
        db.refresh(user)
        
    # Create JWT
    token = create_access_token(user.id)
    
    # Redirect to frontend
    return RedirectResponse(f"http://localhost:5173/login?token={token}")