package com.sparesy.core.workflow.events;

import com.sparesy.core.entity.Project;
import org.springframework.context.ApplicationEvent;

// Fired by ProjectService when a client submits a new project
// WorkflowService listens for this and sets initial status
public class ProjectSubmittedEvent extends ApplicationEvent {

    private final Project project;

    public ProjectSubmittedEvent(Object source, Project project) {
        super(source);
        this.project = project;
    }

    public Project getProject() {
        return project;
    }
}