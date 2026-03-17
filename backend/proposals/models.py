from django.db import models
from users.models import User


class Proposal(models.Model):

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    ]

    project = models.ForeignKey(
       "projects.Project",
        related_name='proposals',
        on_delete=models.CASCADE
    )

    freelancer = models.ForeignKey(
        User,
        related_name='proposals',
        on_delete=models.CASCADE
    )

    bid_amount = models.DecimalField(max_digits=10, decimal_places=2)
    duration = models.IntegerField(help_text="Duration in days")
    cover_letter = models.TextField()

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Proposal {self.id} - {self.status}"