from src.domain.errors import AuthenticationError, ValidationError
from src.domain.mappers import to_safe_user
from src.domain.models import LoginInput, RegisterUserInput, SafeUser, Session, StoredUser
from src.domain.validators import validate_login_input, validate_register_input
from src.infrastructure.clock import now_iso
from src.infrastructure.ids import create_id
from src.infrastructure.passwords import hash_password, verify_password
from src.repositories.session_repository import SessionRepository
from src.repositories.user_repository import UserRepository


class AuthService:
    def __init__(self, users: UserRepository, sessions: SessionRepository) -> None:
        self._users = users
        self._sessions = sessions

    def register(self, input_data: RegisterUserInput) -> SafeUser:
        validated = validate_register_input(input_data)
        existing_user = self._users.find_by_email(validated.email)
        if existing_user:
            raise ValidationError("该邮箱已被注册")

        user = StoredUser(
            id=create_id(),
            email=validated.email,
            password_hash=hash_password(validated.password),
            display_name=validated.display_name,
            created_at=now_iso(),
        )
        self._users.create(user)
        return to_safe_user(user)

    def login(self, input_data: LoginInput) -> Session:
        validated = validate_login_input(input_data)
        user = self._users.find_by_email(validated.email)

        if not user or not verify_password(validated.password, user.password_hash):
            raise AuthenticationError("邮箱或密码错误")

        session = Session(id=create_id(), user_id=user.id, created_at=now_iso())
        self._sessions.create(session)
        return session

    def logout(self, session_id: str) -> None:
        self._sessions.delete_by_id(session_id)

    def get_user_by_session(self, session_id: str | None) -> SafeUser | None:
        if not session_id:
            return None

        session = self._sessions.find_by_id(session_id)
        if not session:
            return None

        user = self._users.find_by_id(session.user_id)
        return to_safe_user(user) if user else None
