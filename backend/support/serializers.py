from rest_framework import serializers
from .models import Ticket, TicketReply

class TicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = '__all__'

class TicketReplySerializer(serializers.ModelSerializer):
    class Meta:
        model = TicketReply
        fields = '__all__'
