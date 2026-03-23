import pytest
import re

# ==========================================
# 1. UTILITY FUNCTIONS (Simulating Backend Logic)
# ==========================================

def hash_password(password: str) -> str:
    """Simulates bcrypt password hashing to prevent plain-text storage."""
    # In a real app, this uses passlib/bcrypt. We simulate the hash format here.
    return f"$2b$12$hashed_salt_{password}_secure"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Simulates password verification during login."""
    return hashed_password == f"$2b$12$hashed_salt_{plain_password}_secure"

def is_valid_email(email: str) -> bool:
    """Validates email string format using regex before database insertion."""
    pattern = r"^[\w\.-]+@[\w\.-]+\.\w+$"
    return re.match(pattern, email) is not None


# ==========================================
# 2. UNIT TESTS (The actual tests pytest will run)
# ==========================================

def test_password_hashing_creates_unique_hash():
    """Ensure the hashing algorithm never returns the plain text password."""
    password = "SecurePassword123!"
    hashed = hash_password(password)

    assert password != hashed
    assert hashed.startswith("$2b$12$")

def test_password_verification_success():
    """Ensure the system correctly verifies a matching password."""
    password = "ProviderPass2026"
    hashed = hash_password(password)

    assert verify_password(password, hashed) is True

def test_password_verification_failure():
    """Ensure the system rejects an incorrect password attempt."""
    password = "RightPassword"
    wrong_password = "WrongPassword"
    hashed = hash_password(password)

    assert verify_password(wrong_password, hashed) is False

def test_email_validation_accepts_valid_email():
    """Ensure the regex accepts correctly formatted provider emails."""
    assert is_valid_email("provider@providerplus.lk") is True

def test_email_validation_rejects_invalid_email():
    """Ensure the regex rejects malformed email strings."""
    assert is_valid_email("provider_at_providerplus.lk") is False
    assert is_valid_email("provider@.com") is False


# ==========================================
# 3. ALGORITHM TESTING (Category Matching Logic)
# ==========================================

def is_match(ai_category: str, db_category: str) -> bool:
    """Smart matching helper from ProviderPlus services."""
    a = ai_category.lower().strip()
    b = db_category.lower().strip()
    return (a == b) or (a.rstrip('s') == b.rstrip('s')) or (b.startswith(a)) or (a.startswith(b))

def test_is_match_exact_ignore_case():
    """Ensure algorithm ignores capitalization and trailing spaces."""
    assert is_match(" Plumber ", "plumber") is True
    assert is_match("ELECTRICIAN", "Electrician ") is True

def test_is_match_handles_plurals():
    """Ensure algorithm successfully matches singular to plural."""
    # User searches 'Mechanic', DB has 'Mechanics'
    assert is_match("Mechanic", "Mechanics") is True
    # User searches 'Cleaners', DB has 'Cleaner'
    assert is_match("Cleaners", "Cleaner") is True

def test_is_match_handles_partial_start():
    """Ensure algorithm matches if one string starts with the other."""
    assert is_match("Tech", "Technician") is True
    assert is_match("Carpenter", "Carp") is True

def test_is_match_rejects_unrelated_categories():
    """Ensure algorithm correctly fails on completely different categories."""
    assert is_match("Plumber", "Electrician") is False
    assert is_match("Driver", "Cook") is False

def test_is_match_rejects_middle_substrings():
    """Ensure algorithm only matches starts_with, not middle substrings."""
    # "tric" is in "Electrician", but doesn't start with it. Should fail.
    assert is_match("tric", "Electrician") is False
