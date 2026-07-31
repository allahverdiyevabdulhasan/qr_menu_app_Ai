from django.contrib import admin
from django.utils.html import format_html
from .models import Ticket, TicketReply

class TicketReplyInline(admin.TabularInline):
    model = TicketReply
    extra = 1
    fields = ('user', 'message', 'is_staff_reply', 'created_at')
    readonly_fields = ('created_at',)

@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ('id', 'restaurant', 'user', 'subject', 'priority', 'status', 'created_at', 'view_screenshot')
    list_filter = ('status', 'priority', 'created_at', 'restaurant')
    search_fields = ('subject', 'message', 'restaurant__name', 'user__username')
    inlines = [TicketReplyInline]
    readonly_fields = ('created_at', 'updated_at', 'view_screenshot_large')
    
    def view_screenshot(self, obj):
        if obj.image:
            return format_html('<a href="{}" target="_blank">🖼️ Görseli Aç</a>', obj.image.url)
        return "-"
    view_screenshot.short_description = "Ekran Görüntüsü"

    def view_screenshot_large(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="max-width: 100%; max-height: 400px; border-radius: 8px; border: 1px solid #ddd;" />', obj.image.url)
        return "Ekran görüntüsü eklenmemiş."
    view_screenshot_large.short_description = "Ekran Görüntüsü Önizleme"

@admin.register(TicketReply)
class TicketReplyAdmin(admin.ModelAdmin):
    list_display = ('id', 'ticket', 'user', 'is_staff_reply', 'created_at')
    list_filter = ('is_staff_reply', 'created_at')
    search_fields = ('message', 'ticket__subject', 'user__username')
