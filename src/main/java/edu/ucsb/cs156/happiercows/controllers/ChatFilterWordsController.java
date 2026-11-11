package edu.ucsb.cs156.happiercows.controllers;

import edu.ucsb.cs156.happiercows.entities.ChatFilterWord;
import edu.ucsb.cs156.happiercows.errors.EntityNotFoundException;
import edu.ucsb.cs156.happiercows.repositories.ChatFilterWordRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@Slf4j
@Tag(name = "Chat Filter Words")
@RequestMapping("/api/chatfilterwords")
@RestController
public class ChatFilterWordsController extends ApiController {

    @Autowired
    private ChatFilterWordRepository chatFilterWordRepository;

    @Operation(summary = "List all inappropriate words that are censored in chat")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/all")
    public Iterable<ChatFilterWord> allChatFilterWords() {
        return chatFilterWordRepository.findAll();
    }

    @Operation(summary = "Add an inappropriate word to be censored in chat")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("")
    public ResponseEntity<Object> postChatFilterWord(
            @Parameter(description = "The word or phrase to censor") @RequestParam String word) {
        String normalized = word.trim().toLowerCase();

        if (normalized.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(genericMessage("Word must not be blank"));
        }

        if (chatFilterWordRepository.findByWord(normalized).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(genericMessage("\"%s\" is already on the list".formatted(normalized)));
        }

        ChatFilterWord saved = chatFilterWordRepository.save(
                ChatFilterWord.builder().word(normalized).build());
        return ResponseEntity.ok(saved);
    }

    @Operation(summary = "Remove a word from the list of inappropriate words")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @DeleteMapping("")
    public Object deleteChatFilterWord(
            @Parameter(description = "id of the word to remove") @RequestParam Long id) {
        ChatFilterWord chatFilterWord = chatFilterWordRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(ChatFilterWord.class, id));
        chatFilterWordRepository.delete(chatFilterWord);
        return genericMessage("ChatFilterWord with id %s deleted".formatted(id));
    }
}
