from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Header
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr, validator
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import re
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

stripe_api_key = os.environ.get('STRIPE_API_KEY')

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    email: str
    name: str
    role: str
    picture: Optional[str] = None
    spotify_link: Optional[str] = None
    created_at: datetime

class SessionData(BaseModel):
    user_id: str
    session_token: str
    expires_at: datetime
    created_at: datetime

class EmailSignupRequest(BaseModel):
    email: EmailStr
    name: str
    role: str

class ArtistApplicationRequest(BaseModel):
    email: EmailStr
    name: str
    spotify_link: str

    @validator('spotify_link')
    def validate_spotify_link(cls, v):
        pattern = r'^https://open\.spotify\.com/artist/[a-zA-Z0-9]+$'
        if not re.match(pattern, v):
            raise ValueError('Invalid Spotify artist link format')
        return v

class ArtistProfile(BaseModel):
    model_config = ConfigDict(extra="ignore")
    artist_id: str
    user_id: str
    name: str
    bio: Optional[str] = None
    profile_image: Optional[str] = None
    status: str
    spotify_link: str
    submitted_at: Optional[datetime] = None
    approved_at: Optional[datetime] = None
    created_at: datetime

class ArtistProfileUpdate(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None
    profile_image: Optional[str] = None

class SubscriptionTier(BaseModel):
    model_config = ConfigDict(extra="ignore")
    tier_id: str
    artist_id: str
    name: str
    price: float
    benefits: List[str]
    stripe_price_id: Optional[str] = None
    created_at: datetime

class SubscriptionTierCreate(BaseModel):
    name: str
    price: float
    benefits: List[str]

class GatedContent(BaseModel):
    model_config = ConfigDict(extra="ignore")
    content_id: str
    artist_id: str
    title: str
    content_type: str
    content_text: Optional[str] = None
    external_link: Optional[str] = None
    tier_ids: List[str]
    created_at: datetime

class GatedContentCreate(BaseModel):
    title: str
    content_type: str
    content_text: Optional[str] = None
    external_link: Optional[str] = None
    tier_ids: List[str]

class Subscription(BaseModel):
    model_config = ConfigDict(extra="ignore")
    subscription_id: str
    fan_user_id: str
    artist_id: str
    tier_id: str
    stripe_subscription_id: Optional[str] = None
    status: str
    started_at: datetime
    ends_at: Optional[datetime] = None

class PaymentTransaction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    transaction_id: str
    session_id: str
    user_id: Optional[str] = None
    artist_id: str
    tier_id: str
    amount: float
    currency: str
    status: str
    payment_status: str
    metadata: dict
    created_at: datetime

class ApprovalRequest(BaseModel):
    approved: bool

async def get_current_user(request: Request, authorization: Optional[str] = Header(None)) -> User:
    session_token = request.cookies.get('session_token')
    if not session_token and authorization:
        session_token = authorization.replace('Bearer ', '')
    
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    session = await db.user_sessions.find_one({"session_token": session_token}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    expires_at = session["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")
    
    user_doc = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    if isinstance(user_doc['created_at'], str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    return User(**user_doc)

@api_router.post("/auth/google-session")
async def process_google_session(request: Request, response: Response):
    data = await request.json()
    session_id = data.get('session_id')
    
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")
    
    try:
        import aiohttp
        async with aiohttp.ClientSession() as session:
            async with session.get(
                'https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data',
                headers={'X-Session-ID': session_id}
            ) as resp:
                if resp.status != 200:
                    raise HTTPException(status_code=400, detail="Invalid session_id")
                user_data = await resp.json()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch session data: {str(e)}")
    
    email = user_data['email']
    name = user_data['name']
    picture = user_data.get('picture')
    session_token = user_data['session_token']
    
    user_doc = await db.users.find_one({"email": email}, {"_id": 0})
    
    if user_doc:
        user_id = user_doc['user_id']
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {"name": name, "picture": picture}}
        )
    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        user_doc = {
            "user_id": user_id,
            "email": email,
            "name": name,
            "role": "fan",
            "picture": picture,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(user_doc)
    
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
        "created_at": datetime.now(timezone.utc)
    })
    
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7 * 24 * 60 * 60
    )
    
    user_doc = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    if isinstance(user_doc['created_at'], str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    return User(**user_doc)

@api_router.post("/auth/email-signup")
async def email_signup(signup_request: EmailSignupRequest, response: Response):
    existing = await db.users.find_one({"email": signup_request.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    session_token = f"session_{uuid.uuid4().hex}"
    
    user_doc = {
        "user_id": user_id,
        "email": signup_request.email,
        "name": signup_request.name,
        "role": signup_request.role,
        "picture": None,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user_doc)
    
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
        "created_at": datetime.now(timezone.utc)
    })
    
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7 * 24 * 60 * 60
    )
    
    if isinstance(user_doc['created_at'], str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    return User(**user_doc)

@api_router.get("/auth/me")
async def get_me(request: Request, authorization: Optional[str] = Header(None)):
    user = await get_current_user(request, authorization)
    return user

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    session_token = request.cookies.get('session_token')
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    response.delete_cookie(key="session_token", path="/")
    return {"message": "Logged out successfully"}

@api_router.post("/artist/apply")
async def apply_as_artist(application: ArtistApplicationRequest):
    existing = await db.users.find_one({"email": application.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    user_doc = {
        "user_id": user_id,
        "email": application.email,
        "name": application.name,
        "role": "artist",
        "picture": None,
        "spotify_link": application.spotify_link,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user_doc)
    
    artist_id = f"artist_{uuid.uuid4().hex[:12]}"
    artist_doc = {
        "artist_id": artist_id,
        "user_id": user_id,
        "name": application.name,
        "bio": None,
        "profile_image": None,
        "status": "draft",
        "spotify_link": application.spotify_link,
        "submitted_at": None,
        "approved_at": None,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.artists.insert_one(artist_doc)
    
    session_token = f"session_{uuid.uuid4().hex}"
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
        "created_at": datetime.now(timezone.utc)
    })
    
    return {"message": "Artist application created", "session_token": session_token, "user_id": user_id}

@api_router.get("/artist/profile")
async def get_artist_profile(request: Request, authorization: Optional[str] = Header(None)):
    user = await get_current_user(request, authorization)
    if user.role != "artist":
        raise HTTPException(status_code=403, detail="Not an artist")
    
    artist_doc = await db.artists.find_one({"user_id": user.user_id}, {"_id": 0})
    if not artist_doc:
        raise HTTPException(status_code=404, detail="Artist profile not found")
    
    for field in ['created_at', 'submitted_at', 'approved_at']:
        if artist_doc.get(field) and isinstance(artist_doc[field], str):
            artist_doc[field] = datetime.fromisoformat(artist_doc[field])
    
    return ArtistProfile(**artist_doc)

@api_router.put("/artist/profile")
async def update_artist_profile(update: ArtistProfileUpdate, request: Request, authorization: Optional[str] = Header(None)):
    user = await get_current_user(request, authorization)
    if user.role != "artist":
        raise HTTPException(status_code=403, detail="Not an artist")
    
    update_data = {k: v for k, v in update.dict(exclude_unset=True).items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    await db.artists.update_one({"user_id": user.user_id}, {"$set": update_data})
    
    artist_doc = await db.artists.find_one({"user_id": user.user_id}, {"_id": 0})
    for field in ['created_at', 'submitted_at', 'approved_at']:
        if artist_doc.get(field) and isinstance(artist_doc[field], str):
            artist_doc[field] = datetime.fromisoformat(artist_doc[field])
    
    return ArtistProfile(**artist_doc)

@api_router.post("/artist/submit")
async def submit_artist_profile(request: Request, authorization: Optional[str] = Header(None)):
    user = await get_current_user(request, authorization)
    if user.role != "artist":
        raise HTTPException(status_code=403, detail="Not an artist")
    
    await db.artists.update_one(
        {"user_id": user.user_id},
        {"$set": {"status": "pending", "submitted_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"message": "Profile submitted for review"}

@api_router.get("/artists/public", response_model=List[ArtistProfile])
async def get_public_artists():
    artists = await db.artists.find({"status": "approved"}, {"_id": 0}).to_list(1000)
    for artist in artists:
        for field in ['created_at', 'submitted_at', 'approved_at']:
            if artist.get(field) and isinstance(artist[field], str):
                artist[field] = datetime.fromisoformat(artist[field])
    return [ArtistProfile(**a) for a in artists]

@api_router.get("/artists/search")
async def search_artists(q: str):
    artists = await db.artists.find(
        {"status": "approved", "name": {"$regex": q, "$options": "i"}},
        {"_id": 0}
    ).to_list(100)
    
    for artist in artists:
        for field in ['created_at', 'submitted_at', 'approved_at']:
            if artist.get(field) and isinstance(artist[field], str):
                artist[field] = datetime.fromisoformat(artist[field])
    
    return [ArtistProfile(**a) for a in artists]

@api_router.get("/artist/{artist_id}")
async def get_artist_by_id(artist_id: str):
    artist_doc = await db.artists.find_one({"artist_id": artist_id, "status": "approved"}, {"_id": 0})
    if not artist_doc:
        raise HTTPException(status_code=404, detail="Artist not found")
    
    for field in ['created_at', 'submitted_at', 'approved_at']:
        if artist_doc.get(field) and isinstance(artist_doc[field], str):
            artist_doc[field] = datetime.fromisoformat(artist_doc[field])
    
    return ArtistProfile(**artist_doc)

@api_router.post("/artist/tiers")
async def create_tier(tier: SubscriptionTierCreate, request: Request, authorization: Optional[str] = Header(None)):
    user = await get_current_user(request, authorization)
    if user.role != "artist":
        raise HTTPException(status_code=403, detail="Not an artist")
    
    artist_doc = await db.artists.find_one({"user_id": user.user_id}, {"_id": 0})
    if not artist_doc:
        raise HTTPException(status_code=404, detail="Artist profile not found")
    
    tier_id = f"tier_{uuid.uuid4().hex[:12]}"
    tier_doc = {
        "tier_id": tier_id,
        "artist_id": artist_doc["artist_id"],
        "name": tier.name,
        "price": tier.price,
        "benefits": tier.benefits,
        "stripe_price_id": None,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.subscription_tiers.insert_one(tier_doc)
    
    if isinstance(tier_doc['created_at'], str):
        tier_doc['created_at'] = datetime.fromisoformat(tier_doc['created_at'])
    
    return SubscriptionTier(**tier_doc)

@api_router.get("/artist/tiers")
async def get_artist_tiers(request: Request, authorization: Optional[str] = Header(None)):
    user = await get_current_user(request, authorization)
    if user.role != "artist":
        raise HTTPException(status_code=403, detail="Not an artist")
    
    artist_doc = await db.artists.find_one({"user_id": user.user_id}, {"_id": 0})
    if not artist_doc:
        raise HTTPException(status_code=404, detail="Artist profile not found")
    
    tiers = await db.subscription_tiers.find({"artist_id": artist_doc["artist_id"]}, {"_id": 0}).to_list(100)
    for tier in tiers:
        if isinstance(tier['created_at'], str):
            tier['created_at'] = datetime.fromisoformat(tier['created_at'])
    
    return [SubscriptionTier(**t) for t in tiers]

@api_router.get("/artist/{artist_id}/tiers")
async def get_artist_tiers_public(artist_id: str):
    tiers = await db.subscription_tiers.find({"artist_id": artist_id}, {"_id": 0}).to_list(100)
    for tier in tiers:
        if isinstance(tier['created_at'], str):
            tier['created_at'] = datetime.fromisoformat(tier['created_at'])
    return [SubscriptionTier(**t) for t in tiers]

@api_router.post("/subscribe/checkout")
async def create_subscription_checkout(data: dict, request: Request, authorization: Optional[str] = Header(None)):
    user = await get_current_user(request, authorization)
    if user.role != "fan":
        raise HTTPException(status_code=403, detail="Only fans can subscribe")
    
    tier_id = data.get('tier_id')
    origin_url = data.get('origin_url')
    
    if not tier_id or not origin_url:
        raise HTTPException(status_code=400, detail="tier_id and origin_url required")
    
    tier_doc = await db.subscription_tiers.find_one({"tier_id": tier_id}, {"_id": 0})
    if not tier_doc:
        raise HTTPException(status_code=404, detail="Tier not found")
    
    amount = float(tier_doc['price'])
    currency = "usd"
    
    success_url = f"{origin_url}/fan/subscription-success?session_id={{{{CHECKOUT_SESSION_ID}}}}"
    cancel_url = f"{origin_url}/artist/{tier_doc['artist_id']}"
    
    host_url = str(request.base_url)
    webhook_url = f"{host_url}api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url=webhook_url)
    
    checkout_request = CheckoutSessionRequest(
        amount=amount,
        currency=currency,
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "user_id": user.user_id,
            "artist_id": tier_doc['artist_id'],
            "tier_id": tier_id,
            "subscription_type": "monthly"
        }
    )
    
    session: CheckoutSessionResponse = await stripe_checkout.create_checkout_session(checkout_request)
    
    transaction_id = f"txn_{uuid.uuid4().hex[:12]}"
    await db.payment_transactions.insert_one({
        "transaction_id": transaction_id,
        "session_id": session.session_id,
        "user_id": user.user_id,
        "artist_id": tier_doc['artist_id'],
        "tier_id": tier_id,
        "amount": amount,
        "currency": currency,
        "status": "pending",
        "payment_status": "initiated",
        "metadata": checkout_request.metadata,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {"checkout_url": session.url, "session_id": session.session_id}

@api_router.get("/subscribe/status/{session_id}")
async def check_subscription_status(session_id: str, request: Request, authorization: Optional[str] = Header(None)):
    user = await get_current_user(request, authorization)
    
    txn = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    if txn['payment_status'] == 'paid':
        return {"status": "paid", "message": "Subscription already active"}
    
    host_url = str(request.base_url)
    webhook_url = f"{host_url}api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url=webhook_url)
    
    checkout_status: CheckoutStatusResponse = await stripe_checkout.get_checkout_status(session_id)
    
    if checkout_status.payment_status == 'paid' and txn['payment_status'] != 'paid':
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {"status": "completed", "payment_status": "paid"}}
        )
        
        subscription_id = f"sub_{uuid.uuid4().hex[:12]}"
        await db.subscriptions.insert_one({
            "subscription_id": subscription_id,
            "fan_user_id": txn['user_id'],
            "artist_id": txn['artist_id'],
            "tier_id": txn['tier_id'],
            "stripe_subscription_id": session_id,
            "status": "active",
            "started_at": datetime.now(timezone.utc).isoformat(),
            "ends_at": None
        })
    
    return {
        "status": checkout_status.status,
        "payment_status": checkout_status.payment_status,
        "amount": checkout_status.amount_total / 100,
        "currency": checkout_status.currency
    }

@api_router.get("/fan/subscriptions")
async def get_fan_subscriptions(request: Request, authorization: Optional[str] = Header(None)):
    user = await get_current_user(request, authorization)
    if user.role != "fan":
        raise HTTPException(status_code=403, detail="Not a fan")
    
    subs = await db.subscriptions.find({"fan_user_id": user.user_id}, {"_id": 0}).to_list(100)
    for sub in subs:
        if isinstance(sub['started_at'], str):
            sub['started_at'] = datetime.fromisoformat(sub['started_at'])
        if sub.get('ends_at') and isinstance(sub['ends_at'], str):
            sub['ends_at'] = datetime.fromisoformat(sub['ends_at'])
    
    return [Subscription(**s) for s in subs]

@api_router.get("/fan/content/{artist_id}")
async def get_accessible_content(artist_id: str, request: Request, authorization: Optional[str] = Header(None)):
    user = await get_current_user(request, authorization)
    if user.role != "fan":
        raise HTTPException(status_code=403, detail="Not a fan")
    
    sub = await db.subscriptions.find_one(
        {"fan_user_id": user.user_id, "artist_id": artist_id, "status": "active"},
        {"_id": 0}
    )
    
    if not sub:
        return []
    
    content_list = await db.gated_content.find(
        {"artist_id": artist_id, "tier_ids": sub['tier_id']},
        {"_id": 0}
    ).to_list(100)
    
    for content in content_list:
        if isinstance(content['created_at'], str):
            content['created_at'] = datetime.fromisoformat(content['created_at'])
    
    return [GatedContent(**c) for c in content_list]

@api_router.post("/artist/content")
async def create_gated_content(content: GatedContentCreate, request: Request, authorization: Optional[str] = Header(None)):
    user = await get_current_user(request, authorization)
    if user.role != "artist":
        raise HTTPException(status_code=403, detail="Not an artist")
    
    artist_doc = await db.artists.find_one({"user_id": user.user_id}, {"_id": 0})
    if not artist_doc:
        raise HTTPException(status_code=404, detail="Artist profile not found")
    
    content_id = f"content_{uuid.uuid4().hex[:12]}"
    content_doc = {
        "content_id": content_id,
        "artist_id": artist_doc["artist_id"],
        "title": content.title,
        "content_type": content.content_type,
        "content_text": content.content_text,
        "external_link": content.external_link,
        "tier_ids": content.tier_ids,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.gated_content.insert_one(content_doc)
    
    if isinstance(content_doc['created_at'], str):
        content_doc['created_at'] = datetime.fromisoformat(content_doc['created_at'])
    
    return GatedContent(**content_doc)

@api_router.get("/artist/content")
async def get_artist_content(request: Request, authorization: Optional[str] = Header(None)):
    user = await get_current_user(request, authorization)
    if user.role != "artist":
        raise HTTPException(status_code=403, detail="Not an artist")
    
    artist_doc = await db.artists.find_one({"user_id": user.user_id}, {"_id": 0})
    if not artist_doc:
        raise HTTPException(status_code=404, detail="Artist profile not found")
    
    content_list = await db.gated_content.find({"artist_id": artist_doc["artist_id"]}, {"_id": 0}).to_list(100)
    for content in content_list:
        if isinstance(content['created_at'], str):
            content['created_at'] = datetime.fromisoformat(content['created_at'])
    
    return [GatedContent(**c) for c in content_list]

@api_router.get("/admin/applications")
async def get_pending_applications(request: Request, authorization: Optional[str] = Header(None)):
    user = await get_current_user(request, authorization)
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    artists = await db.artists.find({"status": "pending"}, {"_id": 0}).to_list(100)
    for artist in artists:
        for field in ['created_at', 'submitted_at', 'approved_at']:
            if artist.get(field) and isinstance(artist[field], str):
                artist[field] = datetime.fromisoformat(artist[field])
    
    return [ArtistProfile(**a) for a in artists]

@api_router.post("/admin/artist/{artist_id}/approve")
async def approve_artist(artist_id: str, approval: ApprovalRequest, request: Request, authorization: Optional[str] = Header(None)):
    user = await get_current_user(request, authorization)
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    new_status = "approved" if approval.approved else "rejected"
    update_data = {"status": new_status}
    if approval.approved:
        update_data["approved_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.artists.update_one({"artist_id": artist_id}, {"$set": update_data})
    
    return {"message": f"Artist {new_status}"}

@api_router.get("/admin/analytics")
async def get_admin_analytics(request: Request, authorization: Optional[str] = Header(None)):
    user = await get_current_user(request, authorization)
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    total_artists = await db.artists.count_documents({"status": "approved"})
    total_fans = await db.users.count_documents({"role": "fan"})
    total_subscriptions = await db.subscriptions.count_documents({"status": "active"})
    pending_applications = await db.artists.count_documents({"status": "pending"})
    
    return {
        "total_artists": total_artists,
        "total_fans": total_fans,
        "total_subscriptions": total_subscriptions,
        "pending_applications": pending_applications
    }

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    body = await request.body()
    signature = request.headers.get("Stripe-Signature")
    
    host_url = str(request.base_url)
    webhook_url = f"{host_url}api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url=webhook_url)
    
    try:
        webhook_response = await stripe_checkout.handle_webhook(body, signature)
        return {"received": True}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    admin_exists = await db.users.find_one({"role": "admin"}, {"_id": 0})
    if not admin_exists:
        admin_id = f"user_{uuid.uuid4().hex[:12]}"
        await db.users.insert_one({
            "user_id": admin_id,
            "email": "admin@favatis.com",
            "name": "Admin",
            "role": "admin",
            "picture": None,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        session_token = "admin_session_default"
        await db.user_sessions.insert_one({
            "user_id": admin_id,
            "session_token": session_token,
            "expires_at": datetime.now(timezone.utc) + timedelta(days=365),
            "created_at": datetime.now(timezone.utc)
        })
        logger.info(f"Default admin created. Email: admin@favatis.com, Session Token: {session_token}")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()