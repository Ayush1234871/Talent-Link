from django.db import models
from users.models import User


class Project(models.Model):

    client = models.ForeignKey(
        User,
        related_name="projects",
        on_delete=models.CASCADE
    )

    title = models.CharField(max_length=255)
    description = models.TextField()
    skills = models.CharField(max_length=255)
    budget = models.DecimalField(max_digits=10, decimal_places=2)
    duration = models.IntegerField(help_text="Duration in days")

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title