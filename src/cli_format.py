import sys


def print_success(message: str) -> None:
    print(f"✔ {message}")


def print_error(message: str) -> None:
    print(f"✖ {message}", file=sys.stderr)


def print_info(message: str) -> None:
    print(f"ℹ {message}")


def print_user(user) -> None:
    print("当前用户")
    print(f"- ID: {user.id}")
    print(f"- 邮箱: {user.email}")
    print(f"- 显示名: {user.display_name}")


def print_listings(listings) -> None:
    if not listings:
        print_info("当前没有符合条件的 MCP 记录")
        return

    for listing in listings:
        print(f"\n{listing.title} ({listing.id})")
        print(f"  简介: {listing.summary}")
        print(f"  版本: {listing.version}")
        print(f"  传输: {listing.transport}")
        print(f"  认证: {listing.auth_type}")
        if listing.source_type == "endpoint":
            source = listing.endpoint_url
        else:
            source = f"{listing.package_registry}:{listing.package_name}"
        print(f"  来源: {source}")
        print(f"  标签: {', '.join(listing.tags) if listing.tags else '无'}")
        print(f"  任务: {', '.join(listing.task_types) if listing.task_types else '无'}")
        print(f"  创建时间: {listing.created_at}")
