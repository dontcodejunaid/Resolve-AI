import asyncio
from backend.app.models import User
from backend.app.database import AsyncSessionLocal
from sqlalchemy.future import select
from backend.app.security.auth import get_password_hash

async def add_bank_user():
    async with AsyncSessionLocal() as s:
        res = await s.execute(select(User).filter(User.id == 'usr_bank'))
        user = res.scalars().first()
        if not user:
            s.add(User(
                id='usr_bank',
                email='bank@gateway.com',
                password_hash=get_password_hash('password123'),
                full_name='Bank Provider Sentinel',
                role='employee'
            ))
            await s.commit()
            print("Bank Provider user successfully created!")
        else:
            print("Bank Provider user already exists.")

if __name__ == '__main__':
    asyncio.run(add_bank_user())
