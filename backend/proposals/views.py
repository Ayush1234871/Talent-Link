from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Proposal
from .serializers import ProposalSerializer
from contracts.models import Contract
from notifications.models import Notification

class ProposalViewSet(viewsets.ModelViewSet):
    queryset = Proposal.objects.all()
    serializer_class = ProposalSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Clients see proposals for their projects, Freelancers see their own proposals
        return Proposal.objects.filter(project__client=user) | Proposal.objects.filter(freelancer=user)

    def perform_create(self, serializer):
        serializer.save(freelancer=self.request.user)

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        proposal = self.get_object()
        
        # Only client of the project can accept a proposal
        if proposal.project.client != request.user:
            return Response({"error": "Only the project owner can accept proposals"}, status=403)
        
        if proposal.status != 'pending':
            return Response({"error": "Proposal already handled"}, status=400)
        
        # Accept proposal
        proposal.status = 'accepted'
        proposal.save()

        # 🤝 MILESTONE 3: Auto-create Contract from accepted proposal
        contract = Contract.objects.create(
            proposal=proposal,
            client=proposal.project.client,
            freelancer=proposal.freelancer,
            terms=proposal.cover_letter, # Default terms from cover letter
            status='active'
        )

        # 🔔 Notify freelancer
        Notification.objects.create(
            user=proposal.freelancer,
            message=f"Your proposal for '{proposal.project.title}' was accepted! Contract # {contract.id} is now active."
        )

        return Response({"message": "Proposal accepted and contract created", "contract_id": contract.id})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        proposal = self.get_object()
        if proposal.project.client != request.user:
            return Response({"error": "Only the project owner can reject proposals"}, status=403)
        
        proposal.status = 'rejected'
        proposal.save()
        return Response({"message": "Proposal rejected"})