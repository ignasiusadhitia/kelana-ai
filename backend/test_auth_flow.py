# ==============================================================================
# INTEGRATION TEST: Session 8 Auth Flow & Multi-User Isolation Verification
# ==============================================================================

import os
from fastapi.testclient import TestClient
from main import app
from database import init_db

# Initialize database and models
init_db()

client = TestClient(app)

def test_full_auth_and_isolation_flow():
    """End-to-end integration test verifying registration, login, JWT validation, and user data isolation."""
    print("\n--- [TEST 1: Register New Users] ---")
    alice_email = f"alice_{os.urandom(4).hex()}@test.com"
    bob_email = f"bob_{os.urandom(4).hex()}@test.com"

    # Register Alice
    res_alice_reg = client.post("/api/v1/auth/register", json={
        "name": "Alice Traveler",
        "email": alice_email,
        "password": "password123"
    })
    assert res_alice_reg.status_code == 201, f"Alice registration failed: {res_alice_reg.text}"
    alice_data = res_alice_reg.json()
    assert "access_token" in alice_data
    alice_token = alice_data["access_token"]
    alice_id = alice_data["user"]["id"]
    print(f"[PASS] Alice registered successfully (ID: {alice_id}, Email: {alice_email})")

    # Register Bob
    res_bob_reg = client.post("/api/v1/auth/register", json={
        "name": "Bob Explorer",
        "email": bob_email,
        "password": "password456"
    })
    assert res_bob_reg.status_code == 201, f"Bob registration failed: {res_bob_reg.text}"
    bob_data = res_bob_reg.json()
    bob_token = bob_data["access_token"]
    bob_id = bob_data["user"]["id"]
    print(f"[PASS] Bob registered successfully (ID: {bob_id}, Email: {bob_email})")

    # Duplicate email check
    res_dup = client.post("/api/v1/auth/register", json={
        "name": "Alice Duplicate",
        "email": alice_email,
        "password": "password123"
    })
    assert res_dup.status_code == 400
    print("[PASS] Duplicate email registration rejected (400 Bad Request)")

    print("\n--- [TEST 2: Login & Password Verification] ---")
    res_alice_login = client.post("/api/v1/auth/login", json={
        "email": alice_email,
        "password": "password123"
    })
    assert res_alice_login.status_code == 200
    assert "access_token" in res_alice_login.json()
    print("[PASS] Alice login successful with correct password (200 OK)")

    res_bad_login = client.post("/api/v1/auth/login", json={
        "email": alice_email,
        "password": "wrong_password"
    })
    assert res_bad_login.status_code == 401
    print("[PASS] Incorrect password rejected (401 Unauthorized)")

    print("\n--- [TEST 3: Unauthenticated Access Guard] ---")
    res_no_auth = client.get("/api/v1/trips")
    assert res_no_auth.status_code == 401
    print("[PASS] GET /api/v1/trips without token rejected (401 Unauthorized)")

    print("\n--- [TEST 4: Create Trips with Backend-Enforced Ownership] ---")
    alice_headers = {"Authorization": f"Bearer {alice_token}"}
    res_alice_trip = client.post("/api/v1/trips", headers=alice_headers, json={
        "destination": "Kyoto, Japan",
        "days": 5,
        "budget": 2000,
        "travel_style": "Solo"
    })
    assert res_alice_trip.status_code == 201, f"Alice create trip failed: {res_alice_trip.text}"
    alice_trip = res_alice_trip.json()
    assert alice_trip["user_id"] == alice_id
    alice_trip_id = alice_trip["id"]
    print(f"[PASS] Alice trip created (Trip #{alice_trip_id}, User ID: {alice_trip['user_id']})")

    bob_headers = {"Authorization": f"Bearer {bob_token}"}
    res_bob_trip = client.post("/api/v1/trips", headers=bob_headers, json={
        "destination": "Seoul, South Korea",
        "days": 3,
        "budget": 900,
        "travel_style": "Backpacker"
    })
    assert res_bob_trip.status_code == 201, f"Bob create trip failed: {res_bob_trip.text}"
    bob_trip = res_bob_trip.json()
    assert bob_trip["user_id"] == bob_id
    bob_trip_id = bob_trip["id"]
    print(f"[PASS] Bob trip created (Trip #{bob_trip_id}, User ID: {bob_trip['user_id']})")

    print("\n--- [TEST 5: Strict Data Isolation in Listing] ---")
    res_alice_list = client.get("/api/v1/trips", headers=alice_headers)
    assert res_alice_list.status_code == 200
    alice_trips = res_alice_list.json()
    assert any(t["id"] == alice_trip_id for t in alice_trips)
    assert not any(t["id"] == bob_trip_id for t in alice_trips)
    print(f"[PASS] Alice's list contains only Alice's trips ({len(alice_trips)} trips, Bob's trips hidden)")

    res_bob_list = client.get("/api/v1/trips", headers=bob_headers)
    assert res_bob_list.status_code == 200
    bob_trips = res_bob_list.json()
    assert any(t["id"] == bob_trip_id for t in bob_trips)
    assert not any(t["id"] == alice_trip_id for t in bob_trips)
    print(f"[PASS] Bob's list contains only Bob's trips ({len(bob_trips)} trips, Alice's trips hidden)")

    print("\n--- [TEST 6: Homework CRUD Authorization Lockdown] ---")
    res_bob_view_alice = client.get(f"/api/v1/trips/{alice_trip_id}", headers=bob_headers)
    assert res_bob_view_alice.status_code == 403
    print("[PASS] Bob viewing Alice's trip rejected (403 Forbidden)")

    res_bob_edit_alice = client.put(f"/api/v1/trips/{alice_trip_id}", headers=bob_headers, json={"budget": 5000})
    assert res_bob_edit_alice.status_code == 403
    print("[PASS] Bob modifying Alice's trip rejected (403 Forbidden)")

    res_bob_del_alice = client.delete(f"/api/v1/trips/{alice_trip_id}", headers=bob_headers)
    assert res_bob_del_alice.status_code == 403
    print("[PASS] Bob deleting Alice's trip rejected (403 Forbidden)")

    res_alice_edit_own = client.put(f"/api/v1/trips/{alice_trip_id}", headers=alice_headers, json={"budget": 2500})
    assert res_alice_edit_own.status_code == 200
    assert res_alice_edit_own.json()["budget"] == 2500
    print("[PASS] Alice modifying her own trip succeeded (200 OK)")

    print("\n--- [TEST 7: User Profile & Security Operations] ---")
    # Alice views profile
    res_alice_profile = client.get("/api/v1/auth/me", headers=alice_headers)
    assert res_alice_profile.status_code == 200
    alice_prof = res_alice_profile.json()
    assert alice_prof["name"] == "Alice Traveler"
    assert alice_prof["total_trips"] >= 1
    assert alice_prof["total_budget"] >= 2000.0
    assert alice_prof["total_days"] >= 5
    assert "Kyoto, Japan" in alice_prof["destinations"]
    print(f"[PASS] Alice /profile stats & analytics verified (Trips: {alice_prof['total_trips']}, Budget: ${alice_prof['total_budget']:,.2f}, Days: {alice_prof['total_days']}, Destinations: {alice_prof['destinations']})")

    # Alice updates her profile name and default travel style
    res_update_prof = client.put("/api/v1/auth/profile", headers=alice_headers, json={
        "name": "Alice Adventure Explorer",
        "default_travel_style": "Backpacker"
    })
    assert res_update_prof.status_code == 200
    assert res_update_prof.json()["name"] == "Alice Adventure Explorer"
    assert res_update_prof.json()["default_travel_style"] == "Backpacker"
    print("[PASS] Alice updated name & default_travel_style to 'Backpacker' (200 OK)")

    # Alice fails to change password with wrong current password
    res_bad_pw = client.put("/api/v1/auth/password", headers=alice_headers, json={
        "current_password": "wrong_current_pw",
        "new_password": "newSecurePassword2026"
    })
    assert res_bad_pw.status_code == 400
    print("[PASS] Password change rejected with wrong current password (400 Bad Request)")

    # Alice successfully changes password
    res_good_pw = client.put("/api/v1/auth/password", headers=alice_headers, json={
        "current_password": "password123",
        "new_password": "newSecurePassword2026"
    })
    assert res_good_pw.status_code == 200
    print("[PASS] Alice changed password successfully (200 OK)")

    # Alice logs in with new password
    res_login_new_pw = client.post("/api/v1/auth/login", json={
        "email": alice_email,
        "password": "newSecurePassword2026"
    })
    assert res_login_new_pw.status_code == 200
    print("[PASS] Alice logged in with new password successfully (200 OK)")

    # Alice soft-deletes her own trip (moves to trash)
    res_alice_del_own = client.delete(f"/api/v1/trips/{alice_trip_id}", headers=alice_headers)
    assert res_alice_del_own.status_code == 200
    print("[PASS] Alice soft-deleted her trip to trash (200 OK)")

    # Trip should not appear in active trips list
    res_active_after_del = client.get("/api/v1/trips", headers=alice_headers)
    assert not any(t["id"] == alice_trip_id for t in res_active_after_del.json())
    print("[PASS] Soft-deleted trip excluded from active trips list (200 OK)")

    # Trip should appear in trash bin list
    res_trash_list = client.get("/api/v1/trips?status=trash", headers=alice_headers)
    assert any(t["id"] == alice_trip_id for t in res_trash_list.json())
    print("[PASS] Soft-deleted trip found in trash bin list (200 OK)")

    # Alice restores the trip back from trash
    res_restore = client.post(f"/api/v1/trips/{alice_trip_id}/restore", headers=alice_headers)
    assert res_restore.status_code == 200
    assert res_restore.json()["deleted_at"] is None
    print("[PASS] Alice restored trip from trash back to active (200 OK)")

    # Trip is back in active list
    res_active_restored = client.get("/api/v1/trips", headers=alice_headers)
    assert any(t["id"] == alice_trip_id for t in res_active_restored.json())
    print("[PASS] Restored trip confirmed back in active list (200 OK)")

    # Alice permanently deletes the trip
    res_perm_del = client.delete(f"/api/v1/trips/{alice_trip_id}/permanent", headers=alice_headers)
    assert res_perm_del.status_code == 200
    print("[PASS] Alice permanently deleted trip from database (200 OK)")

    print("\n--- [TEST 8: Danger Zone - Delete Account & Cascade Cleanup] ---")
    # Alice permanently deletes her account
    res_del_acc = client.delete("/api/v1/auth/account", headers=alice_headers)
    assert res_del_acc.status_code == 200
    print("[PASS] Alice account deleted successfully (200 OK)")

    # Alice's token should no longer be able to authenticate
    res_deleted_profile = client.get("/api/v1/auth/me", headers=alice_headers)
    assert res_deleted_profile.status_code == 401
    print("[PASS] Deleted user token rejected on subsequent requests (401 Unauthorized)")

    # Alice should no longer be able to log in
    res_deleted_login = client.post("/api/v1/auth/login", json={
        "email": alice_email,
        "password": "newSecurePassword2026"
    })
    assert res_deleted_login.status_code == 401
    print("[PASS] Deleted user cannot log in (401 Unauthorized)")

    print("\n========================================================")
    print("ALL 8 AUTH, PROFILE, SECURITY & PRIVACY TESTS PASSED 100%!")
    print("========================================================")

def test_register_rate_limiting():
    """Verify IP-based registration rate limiting blocks automated spam attempts with 429."""
    print("\n--- [TEST 9: Register Rate Limiting Protection] ---")
    from utils.rate_limiter import register_rate_limiter
    register_rate_limiter.reset()

    test_ip_headers = {"x-forwarded-for": "198.51.100.42"}
    # Max 5 registrations per minute per IP
    for i in range(5):
        res = client.post("/api/v1/auth/register", headers=test_ip_headers, json={
            "name": f"Spam Bot {i}",
            "email": f"bot_{i}_{os.urandom(4).hex()}@spam.com",
            "password": "password123"
        })
        assert res.status_code == 201, f"Expected 201 on attempt {i+1}, got {res.status_code}: {res.text}"

    # 6th request from same IP must be blocked with 429
    res_blocked = client.post("/api/v1/auth/register", headers=test_ip_headers, json={
        "name": "Spam Bot 6",
        "email": f"bot_6_{os.urandom(4).hex()}@spam.com",
        "password": "password123"
    })
    assert res_blocked.status_code == 429, f"Expected 429 Too Many Requests, got {res_blocked.status_code}: {res_blocked.text}"
    assert "Retry-After" in res_blocked.headers
    print(f"[PASS] 6th registration blocked with 429 Too Many Requests (Retry-After: {res_blocked.headers.get('Retry-After')}s)")


if __name__ == "__main__":
    test_full_auth_and_isolation_flow()
    test_register_rate_limiting()
