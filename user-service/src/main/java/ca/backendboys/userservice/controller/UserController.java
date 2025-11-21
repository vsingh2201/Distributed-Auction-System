package ca.backendboys.userservice.controller;


import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import ca.backendboys.userservice.service.UserService;
import ca.backendboys.userservice.model.User;
import ca.backendboys.userservice.model.Address;
import java.util.List;

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
}
