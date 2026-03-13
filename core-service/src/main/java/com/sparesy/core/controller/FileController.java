package com.sparesy.core.controller;

import com.sparesy.core.entity.Project;
import com.sparesy.core.service.FileService;
import com.sparesy.core.service.ProjectService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

// Handles Gerber and BOM file uploads from the client portal
// Files are saved to ./uploads/{projectId}/ on the server filesystem
// After saving, the file path is stored on the Project entity
@RestController
@RequestMapping("/api/files")
public class FileController {

    private final FileService fileService;
    private final ProjectService projectService;

    public FileController(FileService fileService, ProjectService projectService) {
        this.fileService = fileService;
        this.projectService = projectService;
    }

    // POST /api/files/upload/{projectId}?fileType=gerber
    // Client uploads a Gerber zip or BOM CSV for their project
    // fileType param must be "gerber" or "bom"
    @PostMapping("/upload/{projectId}")
    public ResponseEntity<String> uploadFile(@PathVariable Long projectId,
                                              @RequestParam String fileType,
                                              @RequestParam MultipartFile file) {

        // Save the file and get back the stored path
        String filePath = fileService.saveFile(file, projectId, fileType);

        // Update the project entity with the file path
        Project project = projectService.getProjectById(projectId);
        if (fileType.equals("gerber")) {
            project.setGerberFilePath(filePath);
        } else if (fileType.equals("bom")) {
            project.setBomFilePath(filePath);
        }

        // Save the updated project with the new file path
        projectService.saveProject(project);

        return ResponseEntity.ok("File uploaded successfully: " + filePath);
    }

    // GET /api/files/{projectId}?fileType=gerber
    // Returns the stored file path for a project
    @GetMapping("/{projectId}")
    public ResponseEntity<String> getFilePath(@PathVariable Long projectId,
                                               @RequestParam String fileType) {
        return ResponseEntity.ok(fileService.getFilePath(projectId, fileType));
    }
}