package com.sparesy.core.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

// Handles all file storage for Gerber and BOM uploads
// Files are stored on the local filesystem under ./uploads/{projectId}/
// File paths are saved on the Project entity after upload
@Service
public class FileService {

    // Reads file.upload.dir from application.properties
    @Value("${file.upload.dir}")
    private String uploadDir;

    // Saves an uploaded file to ./uploads/{projectId}/{fileType}.{extension}
    // fileType should be "gerber" or "bom"
    // Returns the full path string to be stored on the Project entity
    public String saveFile(MultipartFile file, Long projectId, String fileType) {
        try {
            // Build the directory path for this project
            Path projectDir = Paths.get(uploadDir, String.valueOf(projectId));

            // Create the directory if it doesn't exist yet
            if (!Files.exists(projectDir)) {
                Files.createDirectories(projectDir);
            }

            // Get the original file extension — e.g. .zip or .csv
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }

            // Build the final file path — e.g. ./uploads/1/gerber.zip
            Path filePath = projectDir.resolve(fileType + extension);

            // Write the file bytes to disk
            Files.write(filePath, file.getBytes());

            // Return the path as a string to store on the Project entity
            return filePath.toString();

        } catch (IOException e) {
            throw new RuntimeException("Failed to save file for project " + projectId + ": " + e.getMessage());
        }
    }

    // Returns the stored file path for a project and file type
    // fileType should be "gerber" or "bom"
    public String getFilePath(Long projectId, String fileType) {
        Path projectDir = Paths.get(uploadDir, String.valueOf(projectId));

        // Check if the directory exists at all
        if (!Files.exists(projectDir)) {
            throw new RuntimeException("No files found for project id: " + projectId);
        }

        // Find a file in the directory that starts with the given fileType
        try {
            return Files.list(projectDir)
                    .filter(p -> p.getFileName().toString().startsWith(fileType))
                    .findFirst()
                    .map(Path::toString)
                    .orElseThrow(() -> new RuntimeException(
                            fileType + " file not found for project id: " + projectId));
        } catch (IOException e) {
            throw new RuntimeException("Failed to retrieve file path: " + e.getMessage());
        }
    }
}