from django.db import models
from django.contrib.auth import get_user_model
from contracts.models import Contract

User = get_user_model()

class Review(models.Model):
    contract = models.ForeignKey(Contract, on_delete=models.CASCADE)
    reviewer = models.ForeignKey(User, on_delete=models.CASCADE)
    rating = models.IntegerField()
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review {self.id}"