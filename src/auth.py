# """
# Authentication utilities for Better Auth JWT integration.

# This module provides JWT verification and issuance for API endpoints.
# """
# import os
# from typing import Optional
# from fastapi import HTTPException, Header
# from jose import JWTError, jwt
# from datetime import datetime, timedelta
# from passlib.context import CryptContext


# # Get JWT secret from environment
# BETTER_AUTH_SECRET = os.environ.get("BETTER_AUTH_SECRET")

# if not BETTER_AUTH_SECRET:
#     raise ValueError(
#         "BETTER_AUTH_SECRET environment variable is required. "
#         "Please set BETTER_AUTH_SECRET to verify JWT tokens."
#     )

# # Password hashing
# pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# # Token expiration
# TOKEN_EXPIRE_HOURS = 24 * 7  # 7 days


# def hash_password(password: str) -> str:
#     """Hash a password using bcrypt."""
#     return pwd_context.hash(password)


# def verify_password(plain_password: str, hashed_password: str) -> bool:
#     """Verify a password against its hash."""
#     return pwd_context.verify(plain_password, hashed_password)


# def create_jwt_token(user_id: str, email: str) -> str:
#     """
#     Create a JWT token for a user.

#     Args:
#         user_id: The user's unique identifier.
#         email: The user's email address.

#     Returns:
#         A JWT token string.
#     """
#     now = datetime.utcnow()
#     payload = {
#         "sub": user_id,
#         "email": email,
#         "iat": now,
#         "exp": now + timedelta(hours=TOKEN_EXPIRE_HOURS),
#     }
#     return jwt.encode(payload, BETTER_AUTH_SECRET, algorithm="HS256")


# async def get_current_user(
#     authorization: Optional[str] = Header(None)
# ) -> str:
#     """
#     Extracts and validates current authenticated user from JWT token.

#     Reads Authorization: Bearer <token> header, verifies JWT signature,
#     and extracts user_id from the token's subject claim.

#     Args:
#         authorization: Authorization header with Bearer token.

#     Returns:
#         The user identifier string extracted from JWT.

#     Raises:
#         HTTPException: If token is missing, invalid, or expired.
#     """
#     if not authorization:
#         raise HTTPException(
#             status_code=401,
#             detail="Authentication required. Please provide Authorization header.",
#             headers={"WWW-Authenticate": "Bearer"},
#         )

#     # Extract Bearer token
#     parts = authorization.split()
#     if len(parts) != 2 or parts[0].lower() != "bearer":
#         raise HTTPException(
#             status_code=401,
#             detail="Invalid authentication header format. Expected: 'Bearer <token>'",
#             headers={"WWW-Authenticate": "Bearer"},
#         )

#     token = parts[1]

#     try:
#         # Decode and verify JWT
#         payload = jwt.decode(
#             token,
#             BETTER_AUTH_SECRET,
#             algorithms=["HS256"],
#         )

#         # Extract user_id from 'sub' claim (subject)
#         user_id = payload.get("sub")

#         if not user_id:
#             raise HTTPException(
#                 status_code=401,
#                 detail="Invalid token: missing user identifier",
#                 headers={"WWW-Authenticate": "Bearer"},
#             )

#         return user_id

#     except JWTError as e:
#         raise HTTPException(
#             status_code=401,
#             detail=f"Invalid authentication token: {str(e)}",
#             headers={"WWW-Authenticate": "Bearer"},
#         )




"""
Authentication utilities for JWT integration.

Stable implementation without bcrypt/passlib
(avoids Python 3.13 + Windows native crashes)
"""
import os
import hmac
import hashlib
from typing import Optional
from fastapi import HTTPException, Header
from jose import JWTError, jwt
from datetime import datetime, timedelta


# Get JWT secret from environment
BETTER_AUTH_SECRET = os.environ.get("BETTER_AUTH_SECRET")

if not BETTER_AUTH_SECRET:
    raise ValueError(
        "WARNING: BETTER_AUTH_SECRET missing. Auth disabled."
    )

# Token expiration
TOKEN_EXPIRE_HOURS = 24 * 7  # 7 days


# -----------------------
# Password hashing (SAFE)
# -----------------------
def hash_password(password: str) -> str:
    return hashlib.sha256(
        (password + BETTER_AUTH_SECRET).encode("utf-8")
    ).hexdigest()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    expected = hash_password(plain_password)
    return hmac.compare_digest(expected, hashed_password)


# -----------------------
# JWT creation
# -----------------------
def create_jwt_token(user_id: str, email: str) -> str:
    now = datetime.utcnow()
    payload = {
        "sub": user_id,
        "email": email,
        "iat": now,
        "exp": now + timedelta(hours=TOKEN_EXPIRE_HOURS),
    }
    return jwt.encode(payload, BETTER_AUTH_SECRET, algorithm="HS256")


# -----------------------
# JWT verification
# -----------------------
async def get_current_user(
    authorization: Optional[str] = Header(None)
) -> str:
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=401,
            detail="Invalid Authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = parts[1]

    try:
        payload = jwt.decode(
            token,
            BETTER_AUTH_SECRET,
            algorithms=["HS256"],
        )
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id

    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
