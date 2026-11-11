package edu.ucsb.cs156.happiercows.services;

import edu.ucsb.cs156.happiercows.entities.ChatFilterWord;
import edu.ucsb.cs156.happiercows.repositories.ChatFilterWordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.regex.Pattern;
import java.util.stream.StreamSupport;

/**
 * Censors chat messages using the admin-maintained list of inappropriate words.
 *
 * Matching is case-insensitive and whole-word only, so a filtered word like
 * "ass" does not censor part of "class". Each match is replaced with one
 * asterisk per character.
 */
@Service
public class ChatFilterService {

    // A match must not be directly preceded or followed by a letter, digit or underscore.
    private static final String NOT_WORD_CHAR_BEFORE = "(?<![\\p{L}\\p{N}_])";
    private static final String NOT_WORD_CHAR_AFTER = "(?![\\p{L}\\p{N}_])";

    @Autowired
    private ChatFilterWordRepository chatFilterWordRepository;

    public String censor(String message) {
        // Longest first, so a phrase like "bad word" is censored before "bad" can break it up.
        List<String> words = StreamSupport
                .stream(chatFilterWordRepository.findAll().spliterator(), false)
                .map(ChatFilterWord::getWord)
                .sorted(Comparator.comparingInt(String::length).reversed())
                .toList();

        String result = message;
        for (String word : words) {
            Pattern pattern = Pattern.compile(
                    NOT_WORD_CHAR_BEFORE + Pattern.quote(word) + NOT_WORD_CHAR_AFTER,
                    Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE);
            result = pattern.matcher(result).replaceAll(match -> "*".repeat(match.group().length()));
        }
        return result;
    }
}
