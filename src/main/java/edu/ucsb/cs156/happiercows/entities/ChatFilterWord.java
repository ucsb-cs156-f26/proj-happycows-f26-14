package edu.ucsb.cs156.happiercows.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * A word (or phrase) that admins have marked as inappropriate.
 * Any occurrence of it in a chat message is replaced with asterisks.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity(name = "chat_filter_words")
public class ChatFilterWord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(nullable = false, unique = true)
    private String word;
}
