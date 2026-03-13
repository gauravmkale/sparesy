package com.sparesy.core.websocket;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

// Sends real-time push notifications to specific companies
// Each company has their own private channel: /topic/company/{companyId}
// Angular subscribes to this channel and receives updates without page refresh
@Service
public class NotificationService {

    // SimpMessagingTemplate is Spring's built-in WebSocket message sender
    // No extra config needed — Spring auto-creates it when WebSocket is enabled
    private final SimpMessagingTemplate messagingTemplate;

    public NotificationService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    // Push a message to a specific company's private channel
    // companyId — who receives the message
    // message — plain text notification e.g. "Your quote has been approved"
    public void push(Long companyId, String message) {
        messagingTemplate.convertAndSend("/topic/company/" + companyId, message);
    }

    // Convenience methods for common notification events

    // Notify client that their quote is ready to review
    public void notifyQuoteReady(Long clientCompanyId, Long projectId) {
        push(clientCompanyId, "QUOTE_READY:" + projectId);
    }

    // Notify client that their production stage has advanced
    public void notifyStageAdvanced(Long clientCompanyId, Long projectId, String stage) {
        push(clientCompanyId, "STAGE_UPDATED:" + projectId + ":" + stage);
    }

    // Notify supplier they have a new component request
    public void notifyNewRequest(Long supplierCompanyId, Long requestId) {
        push(supplierCompanyId, "NEW_REQUEST:" + requestId);
    }

    // Notify manufacturer that a supplier has submitted a quote
    public void notifySupplierQuoteSubmitted(Long manufacturerCompanyId, Long requestId) {
        push(manufacturerCompanyId, "SUPPLIER_QUOTED:" + requestId);
    }
}