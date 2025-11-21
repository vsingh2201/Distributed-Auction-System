package ca.backendboys.userservice.repository;



import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;
import ca.backendboys.userservice.model.User;

@Repository
public interface UserRepository extends CrudRepository<User, Integer> {
    User findByEmail(String email);
    User findByEmailAndPassword(String email, String password);
}

