import asyncio
from backend.app.models import User
from backend.app.database import AsyncSessionLocal
from sqlalchemy.future import select
from backend.app.security.auth import verify_password, get_password_hash

async def check():
    async with AsyncSessionLocal() as s:
        res = await s.execute(select(User))
        users = res.scalars().all()
        for u in users:
            valid = verify_password("password123", u.password_hash)
            print(f"User: {u.email} | Role: {u.role} | Valid password123: {valid}")
            if not valid:
                u.password_hash = get_password_hash("password123")
        await s.commit()
        print("Updated all users with fresh password123 hash.")

if __name__ == "__main__":
    asyncio.run(check())
