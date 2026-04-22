package com.scms;

import com.scms.model.Role;
import com.scms.model.User;
import com.scms.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class SmartComplaintSystemApplication implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public static void main(String[] args) {
        SpringApplication.run(SmartComplaintSystemApplication.class, args);
    }

    @Override
    public void run(String... args) throws Exception {
        // Create sample users if they don't exist
        if (userRepository.count() == 0) {
            createSampleUsers();
        }
    }

    private void createSampleUsers() {
        // Admin user
        User admin = new User();
        admin.setName("Admin User");
        admin.setEmail("admin@scms.com");
        admin.setPassword(passwordEncoder.encode("password"));
        admin.setRole(Role.ADMIN);
        userRepository.save(admin);

        // Staff users
        User staff1 = new User();
        staff1.setName("John Staff");
        staff1.setEmail("john.staff@scms.com");
        staff1.setPassword(passwordEncoder.encode("password"));
        staff1.setRole(Role.STAFF);
        userRepository.save(staff1);

        User staff2 = new User();
        staff2.setName("Jane Staff");
        staff2.setEmail("jane.staff@scms.com");
        staff2.setPassword(passwordEncoder.encode("password"));
        staff2.setRole(Role.STAFF);
        userRepository.save(staff2);

        User staff3 = new User();
        staff3.setName("Bob Staff");
        staff3.setEmail("bob.staff@scms.com");
        staff3.setPassword(passwordEncoder.encode("password"));
        staff3.setRole(Role.STAFF);
        userRepository.save(staff3);

        // Regular users
        User user1 = new User();
        user1.setName("Alice Johnson");
        user1.setEmail("alice@example.com");
        user1.setPassword(passwordEncoder.encode("password"));
        user1.setRole(Role.USER);
        userRepository.save(user1);

        User user2 = new User();
        user2.setName("Bob Smith");
        user2.setEmail("bob@example.com");
        user2.setPassword(passwordEncoder.encode("password"));
        user2.setRole(Role.USER);
        userRepository.save(user2);

        User user3 = new User();
        user3.setName("Charlie Brown");
        user3.setEmail("charlie@example.com");
        user3.setPassword(passwordEncoder.encode("password"));
        user3.setRole(Role.USER);
        userRepository.save(user3);

        System.out.println("Sample users created successfully!");
    }
}