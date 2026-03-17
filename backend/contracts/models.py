from django.db import models
from django.contrib.auth import get_user_model
from proposals.models import Proposal

User = get_user_model()

class Contract(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('active', 'Active'),
        ('completed', 'Completed'),
    ]

    proposal = models.OneToOneField(Proposal, on_delete=models.CASCADE)
    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name='client_contracts')
    freelancer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='freelancer_contracts')
    terms = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Contract {self.id}"