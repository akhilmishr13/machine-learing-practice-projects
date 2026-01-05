"""
Quick API test script
"""
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    """Test health endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}
    print("✅ Health check passed")

def test_habits():
    """Test habits endpoint"""
    # Get habits (should be empty initially)
    response = client.get("/api/v1/habits/habits")
    assert response.status_code == 200
    data = response.json()
    assert "habits" in data
    print(f"✅ Get habits passed: {len(data['habits'])} habits")
    
    # Create a habit
    response = client.post(
        "/api/v1/habits/habits",
        json={"name": "Test Habit", "color": "#6366f1"}
    )
    assert response.status_code == 200
    habit = response.json()["habit"]
    assert habit["name"] == "Test Habit"
    print(f"✅ Create habit passed: {habit['id']}")
    
    # Get habits again (should have one now)
    response = client.get("/api/v1/habits/habits")
    assert response.status_code == 200
    assert len(response.json()["habits"]) >= 1
    print("✅ Get habits after create passed")
    
    return habit["id"]

def test_journal():
    """Test journal endpoint"""
    from datetime import date, timedelta
    
    # Get journal entries
    response = client.get("/api/v1/journal/entries")
    assert response.status_code == 200
    data = response.json()
    assert "entries" in data
    print(f"✅ Get journal entries passed: {len(data['entries'])} entries")
    
    # Create a journal entry for tomorrow (to avoid conflicts)
    tomorrow = (date.today() + timedelta(days=1)).isoformat()
    response = client.post(
        "/api/v1/journal/entries",
        json={
            "date": tomorrow,
            "text": "Test entry",
            "layers": []
        }
    )
    assert response.status_code == 200
    entry = response.json()["entry"]
    print(f"✅ Create journal entry passed: {entry['id']}")
    
    # Test getting entry by date
    response = client.get(f"/api/v1/journal/entries/{tomorrow}")
    assert response.status_code == 200
    assert response.json()["entry"] is not None
    print("✅ Get journal entry by date passed")

if __name__ == "__main__":
    print("🧪 Running API tests...\n")
    try:
        test_health()
        habit_id = test_habits()
        test_journal()
        print("\n✅ All tests passed!")
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        import traceback
        traceback.print_exc()

