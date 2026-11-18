package edu.ucsb.cs156.happiercows.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

import java.util.Arrays;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import edu.ucsb.cs156.happiercows.entities.ChatFilterWord;
import edu.ucsb.cs156.happiercows.repositories.ChatFilterWordRepository;

@ExtendWith(SpringExtension.class)
@Import(ChatFilterService.class)
@ContextConfiguration
public class ChatFilterServiceTests {

    @MockBean
    ChatFilterWordRepository chatFilterWordRepository;

    @Autowired
    ChatFilterService chatFilterService;

    private void givenFilterWords(String... words) {
        List<ChatFilterWord> list = Arrays.stream(words)
                .map(w -> ChatFilterWord.builder().word(w).build())
                .toList();
        when(chatFilterWordRepository.findAll()).thenReturn(list);
    }

    @Test
    public void message_is_unchanged_when_filter_list_is_empty() {
        givenFilterWords();
        assertEquals("You darn cow!", chatFilterService.censor("You darn cow!"));
    }

    @Test
    public void message_without_filtered_words_is_unchanged() {
        givenFilterWords("darn", "heck");
        assertEquals("Hello farmers!", chatFilterService.censor("Hello farmers!"));
    }

    @Test
    public void filtered_word_is_replaced_with_same_number_of_asterisks() {
        givenFilterWords("darn");
        assertEquals("You **** cow!", chatFilterService.censor("You darn cow!"));
    }

    @Test
    public void matching_ignores_case() {
        givenFilterWords("darn");
        assertEquals("**** **** ****", chatFilterService.censor("Darn DARN dArN"));
    }

    @Test
    public void every_occurrence_of_every_word_is_censored() {
        givenFilterWords("darn", "heck");
        assertEquals("****, what the ****, ****!",
                chatFilterService.censor("darn, what the heck, darn!"));
    }

    @Test
    public void word_inside_a_longer_word_is_not_censored() {
        givenFilterWords("ass");
        assertEquals("class assignment bass ***",
                chatFilterService.censor("class assignment bass ass"));
    }

    @Test
    public void digits_and_underscores_count_as_part_of_a_word() {
        givenFilterWords("darn");
        assertEquals("darn1 1darn darn_ _darn ****",
                chatFilterService.censor("darn1 1darn darn_ _darn darn"));
    }

    @Test
    public void accented_letters_count_as_part_of_a_word() {
        givenFilterWords("darn");
        assertEquals("darné édarn ****", chatFilterService.censor("darné édarn darn"));
    }

    @Test
    public void punctuation_next_to_a_word_does_not_prevent_a_match() {
        givenFilterWords("darn");
        assertEquals("(****) \"****\" ****?!",
                chatFilterService.censor("(darn) \"darn\" darn?!"));
    }

    @Test
    public void phrase_is_censored_keeping_its_whitespace() {
        givenFilterWords("silly goose");
        assertEquals("you ***** *****", chatFilterService.censor("you silly goose"));
    }

    @Test
    public void phrase_matches_with_extra_whitespace_between_words() {
        givenFilterWords("silly goose");
        assertEquals("you *****  \t *****",
                chatFilterService.censor("you silly  \t goose"));
    }

    @Test
    public void phrase_is_matched_before_a_shorter_word_it_contains() {
        // "bad" comes first in the list; the phrase must still win.
        givenFilterWords("bad", "bad word");
        assertEquals("a *** **** and a *** day",
                chatFilterService.censor("a bad word and a bad day"));
    }

    @Test
    public void regex_characters_in_a_word_are_matched_literally() {
        givenFilterWords("d.rn", "a+b");
        assertEquals("darn **** aab ***",
                chatFilterService.censor("darn d.rn aab a+b"));
    }

    @Test
    public void dollar_signs_and_backslashes_in_the_message_are_preserved() {
        givenFilterWords("darn");
        assertEquals("$1 \\ **** $0", chatFilterService.censor("$1 \\ darn $0"));
    }

    @Test
    public void wordToRegex_joins_phrase_words_with_flexible_whitespace() {
        assertEquals("\\Qsilly\\E\\s+\\Qgoose\\E",
                ChatFilterService.wordToRegex("silly goose"));
    }
}
