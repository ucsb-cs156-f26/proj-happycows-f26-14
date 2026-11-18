package edu.ucsb.cs156.happiercows.services;

import edu.ucsb.cs156.happiercows.entities.ChatFilterWord;
import edu.ucsb.cs156.happiercows.repositories.ChatFilterWordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

/**
 * Censors words and phrases on the admin-maintained filter list
 * (see {@link ChatFilterWord}) in chat messages. See issue #19.
 *
 * <ul>
 * <li>Matching ignores case.</li>
 * <li>Only whole words and phrases match: filtering "ass" does not
 * censor "class".</li>
 * <li>Each censored character becomes an asterisk, so the censored
 * text keeps its length ("darn" becomes "****"). Whitespace inside a
 * censored phrase is kept.</li>
 * <li>A phrase matches even if the message has extra whitespace
 * between its words.</li>
 * </ul>
 */
@Service
public class ChatFilterService {

    /** Letters, digits, and underscore count as part of a word. */
    private static final String WORD_CHAR = "[\\p{L}\\p{N}_]";

    @Autowired
    private ChatFilterWordRepository chatFilterWordRepository;

    /**
     * Returns the message with every filtered word or phrase replaced by
     * asterisks. A message with no filtered words is returned unchanged.
     */
    public String censor(String message) {
        // Longest first, so a phrase like "bad word" is matched before
        // a shorter entry like "bad" can claim part of it.
        List<String> words = StreamSupport
                .stream(chatFilterWordRepository.findAll().spliterator(), false)
                .map(ChatFilterWord::getWord)
                .sorted(Comparator.comparingInt(String::length).reversed())
                .toList();

        if (words.isEmpty()) {
            return message;
        }

        String alternatives = words.stream()
                .map(ChatFilterService::wordToRegex)
                .collect(Collectors.joining("|"));

        Pattern pattern = Pattern.compile(
                "(?<!" + WORD_CHAR + ")(?:" + alternatives + ")(?!" + WORD_CHAR + ")",
                Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE);

        return pattern.matcher(message)
                .replaceAll(match -> match.group().replaceAll("\\S", "*"));
    }

    /**
     * Converts a stored word or phrase into a regex that matches it
     * literally, allowing any run of whitespace between its words.
     * Stored words are already trimmed and single-spaced.
     */
    static String wordToRegex(String word) {
        return Arrays.stream(word.split(" "))
                .map(Pattern::quote)
                .collect(Collectors.joining("\\s+"));
    }
}
