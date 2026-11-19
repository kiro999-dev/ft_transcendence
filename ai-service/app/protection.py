"""Small per-process rate limit and shared service credential check."""
import hmac
import os
import time
from collections import defaultdict, deque
from fastapi import HTTPException, Request

requests = defaultdict(deque)


def check_access(request: Request):
    expected = os.getenv('AI_API_TOKEN')
    if not expected:
        raise HTTPException(status_code=503, detail='AI_API_TOKEN is not configured')
    supplied = request.headers.get('Authorization', '')
    if not hmac.compare_digest(supplied, 'Bearer ' + expected):
        raise HTTPException(status_code=401, detail='Invalid service token')


def check_rate_limit(request: Request):
    # Development limit per client process; use a shared store for multiple workers.
    try:
        limit = max(1, int(os.getenv('AI_REQUESTS_PER_MINUTE', '30')))
    except ValueError:
        limit = 30
    key = request.client.host if request.client else 'unknown'
    now = time.monotonic()
    recent = requests[key]
    while recent and recent[0] <= now - 60:
        recent.popleft()
    if len(recent) >= limit:
        raise HTTPException(status_code=429, detail='Too many requests; try again later')
    recent.append(now)
