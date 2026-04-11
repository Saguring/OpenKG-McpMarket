from src.domain.models import SafeUser, StoredUser


def to_safe_user(user: StoredUser) -> SafeUser:
    return SafeUser(
        id=user.id,
        email=user.email,
        display_name=user.display_name,
        created_at=user.created_at,
    )
