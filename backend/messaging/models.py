from django.db import models
from django.contrib.auth import get_user_model
from contracts.models import Contract

User = get_user_model()

class Message(models.Model):
    contract = models.ForeignKey(Contract, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Message {self.id}"