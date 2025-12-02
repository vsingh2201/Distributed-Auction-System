package ca.backendboys.userservice.controller;


import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import ca.backendboys.userservice.service.UserService;
import ca.backendboys.userservice.model.User;
import ca.backendboys.userservice.model.Address;
import java.util.List;

;

@RestController
public class UserController {

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/users")
    public Iterable<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @PostMapping("/auth/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        // Check if user already exists
        if (userService.findByEmail(user.getEmail()) != null) {
            return ResponseEntity.badRequest().body("Email already registered");
        }

        // Basic validation
        if (user.getUsername() == null || user.getPassword() == null || user.getEmail() == null) {
            return ResponseEntity.badRequest().body("Username, password and email are required");
        }

        // Address validation
        Address address = user.getAddress();
        if (address == null) {
            return ResponseEntity.badRequest().body("Address is required");
        }
        if (address.getStreetName() == null || address.getStreetNumber() == null ||
                address.getCity() == null || address.getCountry() == null ||
                address.getPostalCode() == null) {
            return ResponseEntity.badRequest().body("All address fields (street name, number, city, country, postal code) are required");
        }

        // Save the new user
        User savedUser = userService.saveUser(user);
        return ResponseEntity.ok(savedUser);
    }

    @PostMapping("/auth/login")
    public ResponseEntity<?> loginUser(@RequestBody User loginRequest) {
        User user = userService.findByEmailAndPassword(
                loginRequest.getEmail(),
                loginRequest.getPassword()
        );

        if (user == null) {
            return ResponseEntity.badRequest().body("Invalid email or password");
        }

        return ResponseEntity.ok(user);
    }
    @PostMapping("/auth/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordRequest resetRequest) {
        //logger.info("Reset password request received - Email: {}", resetRequest.getEmail());

        User user = userService.findByEmail(resetRequest.getEmail());

        if (user == null) {
            return ResponseEntity.badRequest().body("Email not found");
        }

        String newPassword = resetRequest.getNewPassword();
        if (newPassword == null || newPassword.isEmpty()) {
            //logger.warn("New password is null or empty");
            return ResponseEntity.badRequest().body("New password is required");
        }

        if (newPassword.length() < 6) {
            return ResponseEntity.badRequest().body("Password must be at least 6 characters long");
        }

        user.setPassword(newPassword);
        userService.saveUser(user);

        return ResponseEntity.ok("Password reset successfully");
    }

    // nested DTO class can stay as you have it
    public static class ResetPasswordRequest {
        private String email;
        private String newPassword;

        public ResetPasswordRequest() {}
        public ResetPasswordRequest(String email, String newPassword) {
            this.email = email;
            this.newPassword = newPassword;
        }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }


}
