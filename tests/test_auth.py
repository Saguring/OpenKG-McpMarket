from src.domain.errors import AuthenticationError, ValidationError
from src.domain.models import LoginInput, RegisterUserInput
from tests.helpers import create_temp_app_context


def test_can_register_and_login() -> None:
    _, context = create_temp_app_context()

    user = context.auth_service.register(
        RegisterUserInput(
            email="alice@example.com",
            password="password123",
            display_name="Alice",
        )
    )

    session = context.auth_service.login(
        LoginInput(
            email="alice@example.com",
            password="password123",
        )
    )

    current_user = context.auth_service.get_user_by_session(session.id)

    assert user.email == "alice@example.com"
    assert current_user is not None
    assert current_user.id == user.id
    assert not hasattr(user, "password_hash")


def test_duplicate_email_is_rejected() -> None:
    _, context = create_temp_app_context()

    context.auth_service.register(
        RegisterUserInput(email="alice@example.com", password="password123", display_name="Alice")
    )

    try:
        context.auth_service.register(
            RegisterUserInput(email="alice@example.com", password="password123", display_name="Alice 2")
        )
    except ValidationError:
        return

    raise AssertionError("应该抛出 ValidationError")


def test_wrong_password_is_rejected() -> None:
    _, context = create_temp_app_context()

    context.auth_service.register(
        RegisterUserInput(email="alice@example.com", password="password123", display_name="Alice")
    )

    try:
        context.auth_service.login(LoginInput(email="alice@example.com", password="wrong-password"))
    except AuthenticationError:
        return

    raise AssertionError("应该抛出 AuthenticationError")
