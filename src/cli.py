import argparse
import sys

from src.app_context import AppContext
from src.cli_format import print_error, print_info, print_listings, print_success, print_user
from src.domain.errors import AppError
from src.domain.models import CliState, CreateMcpListingInput, LoginInput, RegisterUserInput, SearchMcpListingsInput


app = AppContext()


def get_current_user():
    state = app.cli_state_store.read()
    user = app.auth_service.get_user_by_session(state.current_session_id)
    if not user:
        raise AppError("当前没有登录用户，请先登录")
    return state, user


def run_safely(action):
    try:
        action()
    except AppError as error:
        print_error(str(error))
        raise SystemExit(1) from error
    except ValueError as error:
        print_error(str(error))
        raise SystemExit(1) from error


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="OpenKG-McpMarket", allow_abbrev=False)
    subparsers = parser.add_subparsers(dest="command", required=True)

    register = subparsers.add_parser("register")
    register.add_argument("--email", required=True)
    register.add_argument("--password", required=True)
    register.add_argument("--name", required=True)

    login = subparsers.add_parser("login")
    login.add_argument("--email", required=True)
    login.add_argument("--password", required=True)

    subparsers.add_parser("logout")
    subparsers.add_parser("me")

    upload = subparsers.add_parser("upload")
    upload.add_argument("--title", required=True)
    upload.add_argument("--summary", required=True)
    upload.add_argument("--version", required=True)
    upload.add_argument("--transport", required=True)
    upload.add_argument("--auth", required=True)
    upload.add_argument("--source-type", required=True)
    upload.add_argument("--endpoint")
    upload.add_argument("--package-name")
    upload.add_argument("--package-registry")
    upload.add_argument("--source-url")
    upload.add_argument("--homepage-url")
    upload.add_argument("--tags")
    upload.add_argument("--tasks")

    delete = subparsers.add_parser("delete")
    delete.add_argument("--id", required=True)

    search = subparsers.add_parser("search")
    search.add_argument("--query")
    search.add_argument("--task")
    search.add_argument("--transport")

    subparsers.add_parser("my-mcps")
    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)

    if args.command == "register":
        run_safely(lambda: handle_register(args))
    elif args.command == "login":
        run_safely(lambda: handle_login(args))
    elif args.command == "logout":
        run_safely(handle_logout)
    elif args.command == "me":
        run_safely(handle_me)
    elif args.command == "upload":
        run_safely(lambda: handle_upload(args))
    elif args.command == "delete":
        run_safely(lambda: handle_delete(args))
    elif args.command == "search":
        run_safely(lambda: handle_search(args))
    elif args.command == "my-mcps":
        run_safely(handle_my_mcps)

    return 0


def handle_register(args) -> None:
    user = app.auth_service.register(
        RegisterUserInput(email=args.email, password=args.password, display_name=args.name)
    )
    print_success("注册成功")
    print_user(user)


def handle_login(args) -> None:
    session = app.auth_service.login(LoginInput(email=args.email, password=args.password))
    app.cli_state_store.write(CliState(current_session_id=session.id))
    user = app.auth_service.get_user_by_session(session.id)
    print_success("登录成功")
    if user:
        print_user(user)


def handle_logout() -> None:
    state = app.cli_state_store.read()
    if not state.current_session_id:
        raise AppError("当前没有登录会话")

    app.auth_service.logout(state.current_session_id)
    app.cli_state_store.clear()
    print_success("已退出登录")


def handle_me() -> None:
    _, user = get_current_user()
    print_user(user)


def handle_upload(args) -> None:
    _, user = get_current_user()
    listing = app.mcp_service.create_listing(
        user.id,
        CreateMcpListingInput(
            title=args.title,
            summary=args.summary,
            version=args.version,
            transport=args.transport,
            auth_type=args.auth,
            source_type=args.source_type,
            endpoint_url=args.endpoint,
            package_name=args.package_name,
            package_registry=args.package_registry,
            source_url=args.source_url,
            homepage_url=args.homepage_url,
            tags=args.tags.split(",") if args.tags else [],
            task_types=args.tasks.split(",") if args.tasks else [],
        ),
    )
    print_success("MCP 上传成功")
    print_listings([listing])


def handle_delete(args) -> None:
    _, user = get_current_user()
    app.mcp_service.delete_listing(user.id, args.id)
    print_success(f"已删除 MCP：{args.id}")


def handle_search(args) -> None:
    listings = app.mcp_service.search_public(
        SearchMcpListingsInput(query=args.query, task_type=args.task, transport=args.transport)
    )
    print_listings(listings)


def handle_my_mcps() -> None:
    _, user = get_current_user()
    print_info("以下是你当前拥有的 MCP")
    print_listings(app.mcp_service.list_owned_by_user(user.id))


if __name__ == "__main__":
    sys.exit(main())
