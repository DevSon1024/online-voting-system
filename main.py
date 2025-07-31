import secrets

# Generate a 256-bit (32-byte) secret key
jwt_secret_key = secrets.token_urlsafe(64)
secret_key = secrets.token_urlsafe(64)

print("JWT_SECRET_KEY =", jwt_secret_key)
print("SECRET_KEY =", secret_key)
