package edu.ucsb.cs156.happiercows.repositories;

import edu.ucsb.cs156.happiercows.entities.ChatFilterWord;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ChatFilterWordRepository extends CrudRepository<ChatFilterWord, Long> {
    Optional<ChatFilterWord> findByWord(String word);
}
