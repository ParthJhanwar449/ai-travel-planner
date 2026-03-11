from passlib.context import CryptContext

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

MAX_BCRYPT_LENGTH = 72


def hash_password(password: str) -> str:
    password = password.encode("utf-8")[:MAX_BCRYPT_LENGTH]
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    plain_password = plain_password.encode("utf-8")[:MAX_BCRYPT_LENGTH]
    return pwd_context.verify(plain_password, hashed_password)
