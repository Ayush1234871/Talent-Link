from django.test import TestCase
from django.contrib.auth import get_user_model
from profiles.models import Profile

User = get_user_model()

class RegistrationTest(TestCase):
    def test_multiple_registrations(self):
        """Test that multiple users can be created correctly with profiles."""
        usernames = ['user1', 'user2', 'user3']
        for username in usernames:
            user = User.objects.create_user(
                username=username,
                password='password123',
                role='client'
            )
            # Verify user exists
            self.assertEqual(User.objects.filter(username=username).count(), 1)
            # Verify profile exists
            self.assertEqual(Profile.objects.filter(user=user).count(), 1)
            
    def test_duplicate_username_fails_gracefully(self):
        """Test that creating a user with an existing username fails at the DB/Model level."""
        User.objects.create_user(username='testuser', password='password123', role='client')
        with self.assertRaises(Exception): # Usually IntegrityError or similar
             User.objects.create_user(username='testuser', password='password123', role='client')
