from datetime import datetime
from dataclasses import dataclass


@dataclass
class AuthToken:
    token: str
    expires_at: datetime
