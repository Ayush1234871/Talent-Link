from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Contract
from .serializers import ContractSerializer
from notifications.models import Notification


class ContractViewSet(viewsets.ModelViewSet):
    serializer_class = ContractSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Contract.objects.filter(client=user) | Contract.objects.filter(freelancer=user)

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        contract = self.get_object()
        new_status = request.data.get('status')

        if contract.client != request.user:
            return Response({"error": "Only client can update status"}, status=403)

        if new_status not in ['active', 'completed']:
            return Response({"error": "Invalid status"}, status=400)

        contract.status = new_status
        contract.save()

        Notification.objects.create(
            user=contract.freelancer,
            message=f"Contract status updated to {new_status}"
        )

        return Response({"message": "Status updated"})

    @action(detail=False, methods=['get'])
    def admin_all(self, request):
        if not request.user.is_staff:
            return Response({"error": "Not authorized"}, status=403)

        contracts = Contract.objects.all()
        serializer = self.get_serializer(contracts, many=True)
        return Response(serializer.data)