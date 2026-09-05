import unittest
from database import get_db, SessionLocal
from models.user import User
from models.trip import Trip
from models.conversation import Conversation
from schemas.conversation import ConversationResponse
from services.conversation_service import (
    create_conversation,
    list_conversations,
    _inject_trip_context,
    BASE_SYSTEM_PROMPT,
)

class TestModel3Bridge(unittest.TestCase):
    def setUp(self):
        self.db = SessionLocal()
        # Find or create a test user
        self.user = self.db.query(User).first()
        if not self.user:
            self.user = User(
                name="Bridge Tester",
                email="bridge_tester@example.com",
                password_hash="fake_hash",
                default_travel_style="Solo"
            )
            self.db.add(self.user)
            self.db.commit()
            self.db.refresh(self.user)

        # Create a test trip
        self.trip = Trip(
            destination="Kyoto, Japan",
            days=5,
            budget=2000.0,
            category="Standard",
            daily_budget=400.0,
            travel_style="Family",
            user_id=self.user.id,
            ai_recommendation="## Day 1: Test"
        )
        self.db.add(self.trip)
        self.db.commit()
        self.db.refresh(self.trip)

    def tearDown(self):
        # Cleanup
        if hasattr(self, "conversation") and self.conversation:
            self.db.query(Conversation).filter(Conversation.id == self.conversation.id).delete()
        if hasattr(self, "trip") and self.trip:
            self.db.query(Trip).filter(Trip.id == self.trip.id).delete()
        self.db.commit()
        self.db.close()

    def test_create_and_link_trip(self):
        """Verify that conversation correctly resolves public trip_id and binds trip."""
        self.conversation = create_conversation(
            db=self.db,
            user_id=self.user.id,
            title="New Conversation",
            trip_id=self.trip.public_id
        )
        self.assertEqual(self.conversation.trip_id, self.trip.id)
        self.assertEqual(self.conversation.title, f"Chat: {self.trip.destination}")
        self.assertEqual(self.conversation.trip_public_id, self.trip.public_id)
        self.assertEqual(self.conversation.trip_destination, self.trip.destination)

    def test_list_conversations_includes_trip_metadata(self):
        """Verify that list_conversations includes trip_id and trip_destination."""
        self.conversation = create_conversation(
            db=self.db,
            user_id=self.user.id,
            title="My Linked Discussion",
            trip_id=self.trip.public_id
        )
        convs = list_conversations(self.db, self.user.id)
        found = next((c for c in convs if c["id"] == self.conversation.public_id), None)
        self.assertIsNotNone(found)
        self.assertEqual(found["trip_id"], self.trip.public_id)
        self.assertEqual(found["trip_destination"], "Kyoto, Japan")

    def test_inject_trip_context(self):
        """Verify that _inject_trip_context grounds the system prompt with trip details."""
        self.conversation = create_conversation(
            db=self.db,
            user_id=self.user.id,
            title="Prompt Grounding Test",
            trip_id=self.trip.public_id
        )
        grounded_prompt = _inject_trip_context(self.conversation, self.db, BASE_SYSTEM_PROMPT)
        self.assertIn("### LINKED ACTIVE TRIP BLUEPRINT:", grounded_prompt)
        self.assertIn("Kyoto, Japan", grounded_prompt)
        self.assertIn("5 days", grounded_prompt)
        self.assertIn("USD 2,000.00", grounded_prompt)
        self.assertIn("USD 400.00/day", grounded_prompt)
        self.assertIn("Family", grounded_prompt)

    def test_soft_delete_preserves_conversation(self):
        """Verify that if trip is soft-deleted or deleted, conversation remains valid."""
        self.conversation = create_conversation(
            db=self.db,
            user_id=self.user.id,
            title="Survival Test",
            trip_id=self.trip.public_id
        )
        # Soft delete trip
        self.trip.deleted_at = self.conversation.created_at
        self.db.commit()
        # Injected prompt should not contain trip context when trip is deleted
        clean_prompt = _inject_trip_context(self.conversation, self.db, BASE_SYSTEM_PROMPT)
        self.assertNotIn("### LINKED ACTIVE TRIP BLUEPRINT:", clean_prompt)

if __name__ == "__main__":
    unittest.main()
