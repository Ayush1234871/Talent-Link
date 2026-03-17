from rest_framework import viewsets, status, exceptions
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Review
from .serializers import ReviewSerializer

class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Review.objects.all()

    def perform_create(self, serializer):
        contract = serializer.validated_data.get('contract')

        if contract.status != 'completed':
            raise exceptions.ValidationError("Cannot review before contract is completed")

        serializer.save(reviewer=self.request.user)

    def admin_all(self, request):
        if not request.user.is_staff:
            return Response({"error": "Not authorized"}, status=403)

        reviews = Review.objects.all()
        serializer = self.get_serializer(reviews, many=True)
        return Response(serializer.data)