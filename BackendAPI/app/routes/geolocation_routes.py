import os
from fastapi import APIRouter, HTTPException, Security, Depends
from fastapi.security import APIKeyHeader
from pydantic import BaseModel

from ..schemas.booking_schemas import BookingResponse
from ..services.geolocation_service import (
    save_sp_location,
    save_sp_base_location,
    find_nearby_sps,
    update_live_location,
    get_live_location,
    get_directions,
    save_pinned_location,
    get_pinned_location,
)
from ..models.provider_model import Provider
from ..models.booking_model import Booking, BookingStatus
from ..models.user_model import User
from ..core.security import get_current_user
from datetime import datetime
from typing import Optional


router = APIRouter(prefix="/geo", tags=["Geolocation"])


# ─── AUTH ─────────────────────────────────────────────────────────────────────
# FIX 5: All mutating endpoints now require an X-API-Key header.
# Set INTERNAL_API_KEY in your .env. The frontend must send this header
# on every request that writes or reads sensitive SP data.
_api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)

def require_api_key(api_key: str = Security(_api_key_header)):
    expected = os.getenv("INTERNAL_API_KEY")
    if not expected:
        raise HTTPException(status_code=500, detail="Server API key not configured")
    if api_key != expected:
        raise HTTPException(status_code=401, detail="Invalid or missing API key")
    return api_key


# ─── REQUEST MODELS ───────────────────────────────────────────────────────────
class AddressRequest(BaseModel):
    sp_id: str
    address: str

class LiveLocationRequest(BaseModel):
    sp_id: str
    lat: float
    lng: float

class NearbyRequest(BaseModel):
    lat: float
    lng: float
    radius_km: float = 10.0

class DirectionsRequest(BaseModel):
    origin_lat: float
    origin_lng: float
    dest_lat: float
    dest_lng: float

class SpBasePinRequest(BaseModel):
    sp_id: str
    lat: float
    lng: float

class PinRequest(BaseModel):
    user_id: str
    lat: float
    lng: float
    label: str | None = None   # The address string already shown on screen.
    # Pass it in to skip a redundant reverse-geocode call.

class LiveLocationUpdate(BaseModel):
    """Sent by the provider's device every 60 seconds while en route."""
    booking_id: str
    latitude: float
    longitude: float


class TrackingResponse(BaseModel):
    """Returned to the user's MapScreen every 60 seconds."""
    provider_name: str
    provider_latitude: Optional[float]
    provider_longitude: Optional[float]
    user_latitude: Optional[float]
    user_longitude: Optional[float]
    has_live_location: bool   # False = provider hasn't started sending yet


# ─── ENDPOINTS ────────────────────────────────────────────────────────────────

@router.post("/save-location", dependencies=[Depends(require_api_key)])
def save_location(request: AddressRequest):
    result = save_sp_location(request.sp_id, request.address)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result


# Called during SP account setup when they drop a pin on the map.
# Accepts raw coordinates from the pin and resolves the address server-side.
@router.post("/sp-base-location", dependencies=[Depends(require_api_key)])
def sp_base_location(request: SpBasePinRequest):
    result = save_sp_base_location(request.sp_id, request.lat, request.lng)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result


# Public — customers need to find nearby SPs without logging in
@router.post("/nearby-sps")
def nearby_sps(request: NearbyRequest):
    result = find_nearby_sps(request.lat, request.lng, request.radius_km)
    return {"service_providers": result}


# Only the SP's own app should call this — requires key
@router.post("/update-live-location", dependencies=[Depends(require_api_key)])
def update_location(request: LiveLocationRequest):
    result = update_live_location(request.sp_id, request.lat, request.lng)
    return result


# Public — customers poll this to track their SP
@router.get("/live-location/{sp_id}")
def live_location(sp_id: str):
    result = get_live_location(sp_id)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result


@router.post("/directions")
def directions(request: DirectionsRequest):
    result = get_directions(
        request.origin_lat,
        request.origin_lng,
        request.dest_lat,
        request.dest_lng
    )
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result


# ─── PIN DROP ─────────────────────────────────────────────────────────────────

# Saves the customer's confirmed pickup pin. Called when they tap "Confirm Booking".
# If the frontend passes the label the user already sees on screen, no extra
# reverse-geocode call is made. If omitted, one is made server-side automatically.
@router.post("/save-pin", dependencies=[Depends(require_api_key)])
def save_pin(request: PinRequest):
    result = save_pinned_location(request.user_id, request.lat, request.lng, request.label)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result


# Returns the last pin saved by a customer — useful for pre-filling the map
# on next app open or showing a "use last location" shortcut.
@router.get("/saved-pin/{user_id}", dependencies=[Depends(require_api_key)])
def saved_pin(user_id: str):
    result = get_pinned_location(user_id)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result


@router.get("/config/maps-key")
async def get_maps_key():
    return { "key": os.getenv("GOOGLE_MAPS_API_KEY") }


@router.post("/live-location", status_code=200)
async def update_live_location(
        data: LiveLocationUpdate,
        current_user: User = Depends(get_current_user),
):
    booking = await Booking.get(data.booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    # Make sure this provider owns the booking
    provider = await Provider.find_one(Provider.user_id == str(current_user.id))
    if not provider or booking.provider_id != str(provider.id):
        raise HTTPException(status_code=403, detail="Not authorised")

    booking.sp_live_latitude   = data.latitude
    booking.sp_live_longitude  = data.longitude
    booking.sp_live_updated_at = datetime.utcnow()
    await booking.save()

    return {"message": "Location updated"}


@router.get("/active", response_model=BookingResponse)
async def get_active_booking(current_user: User = Depends(get_current_user)):
    """
    Returns the provider's current active booking (status = confirmed).
    Called by the provider's dashboard to know which booking to send
    live location updates for.
    Returns 404 if there is no active booking right now.
    """
    provider = await Provider.find_one(Provider.user_id == str(current_user.id))
    if not provider:
        raise HTTPException(status_code=404, detail="Provider profile not found")

    booking = await Booking.find_one(
        Booking.provider_id == str(provider.id),
        Booking.status == BookingStatus.confirmed,
        )

    if not booking:
        raise HTTPException(status_code=404, detail="No active booking found")

    return BookingResponse(
        booking_id=str(booking.id),
        status=booking.status,
    )


@router.get("/{booking_id}", response_model=TrackingResponse)
async def get_tracking_data(
        booking_id: str,
        current_user: User = Depends(get_current_user),
):
    booking = await Booking.get(booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if booking.user_id != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorised")

    provider = await Provider.get(booking.provider_id)
    provider_name = provider.name if provider else "Provider"

    has_live = booking.sp_live_latitude is not None

    # Fall back to registered business location if no live position yet
    provider_lat = booking.sp_live_latitude
    provider_lng = booking.sp_live_longitude

    if not has_live and provider and provider.location:
        coords = provider.location.get("coordinates")
        if coords and len(coords) == 2:
            provider_lng = coords[0]
            provider_lat = coords[1]

    return TrackingResponse(
        provider_name=provider_name,
        provider_latitude=provider_lat,
        provider_longitude=provider_lng,
        user_latitude=booking.user_latitude,
        user_longitude=booking.user_longitude,
        has_live_location=has_live,
    )

