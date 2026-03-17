from rest_framework import viewsets, permissions
from django.db.models import Q
from .models import Project
from .serializers import ProjectSerializer
from proposals.models import Proposal

class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Get IDs of projects that already have an accepted proposal (someone been hired)
        hired_project_ids = Proposal.objects.filter(
            status='accepted'
        ).values_list('project_id', flat=True)

        # Return all projects EXCEPT: hired projects that the current user didn't post
        return Project.objects.filter(
            Q(client=user) | ~Q(id__in=hired_project_ids)
        )

    def perform_create(self, serializer):
        serializer.save(client=self.request.user)
