package com.sparesy.core.workflow.events;

import com.sparesy.core.entity.Project;
import com.sparesy.core.entity.Quote;
import org.springframework.context.ApplicationEvent;

// Fired by QuoteService when client approves a quote
// WorkflowService listens and auto-creates production order + records transactions
public class QuoteApprovedEvent extends ApplicationEvent {

    private final Project project;
    private final Quote quote;

    public QuoteApprovedEvent(Object source, Project project, Quote quote) {
        super(source);
        this.project = project;
        this.quote = quote;
    }

    public Project getProject() {
        return project;
    }

    public Quote getQuote() {
        return quote;
    }
}