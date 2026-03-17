from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Message
from .serializers import MessageSerializer
from contracts.models import Contract
from notifications.models import Notification


class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        contract_id = self.request.query_params.get('contract')

        if not contract_id:
            return Message.objects.none()

        try:
            contract = Contract.objects.get(id=contract_id)
        except Contract.DoesNotExist:
            return Message.objects.none()

        if self.request.user not in [contract.client, contract.freelancer]:
            return Message.objects.none()

        return Message.objects.filter(contract=contract)

    def perform_create(self, serializer):
        contract = serializer.validated_data.get('contract')

        if self.request.user not in [contract.client, contract.freelancer]:
            raise PermissionError("Not part of this contract")

        message = serializer.save(sender=self.request.user)

        receiver = contract.client if message.sender == contract.freelancer else contract.freelancer

        Notification.objects.create(
            user=receiver,
            message="You have a new message in your contract."
        )

    @action(detail=True, methods=['patch'])
    def mark_read(self, request, pk=None):
        message = self.get_object()

        if request.user not in [message.contract.client, message.contract.freelancer]:
            return Response({"error": "Not authorized"}, status=403)

        message.is_read = True
        message.save()

        return Response({"message": "Marked as read"})