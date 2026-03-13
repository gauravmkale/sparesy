package com.sparesy.core.workflow.events;

import com.sparesy.core.entity.Project;
import org.springframework.context.ApplicationEvent;

// Fired by RequestService when manufacturer approves the last pending request
// WorkflowService listens and advances project status to QUOTED
public class AllRequestsApprovedEvent extends ApplicationEvent {

    private final Project project;

    public AllRequestsApprovedEvent(Object source, Project project) {
        super(source);
        this.project = project;
    }

    public Project getProject() {
        return project;
    }
}