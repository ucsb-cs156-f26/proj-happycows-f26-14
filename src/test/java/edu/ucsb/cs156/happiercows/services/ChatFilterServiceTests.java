package edu.ucsb.cs156.happiercows.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

import edu.ucsb.cs156.happiercows.entities.ChatFilterWord;
import edu.ucsb.cs156.happiercows.repositories.ChatFilterWordRepository;
import java.util.Arrays;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.junit.jupiter.api.extension.ExtendWith;

@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = ChatFilterService.class)
public class ChatFilterServiceTests {

    @MockBean
    ChatFilterWordRepository chatFilterWordRepository;

    @Autowired
    ChatFilterService chatFilterService;

    private void givenWords(String... words) {
        List<ChatFilterWord> list = Arrays.stream(words)
                .map(w -> ChatFilterWord.builder().word(w).build())
                .toList();
        when(chatFilterWordRepository.findAll()).thenReturn(list);
    }

    @Test
    public void messageUnchangedWhenListIsEmpty() {
        givenWords();
        assertEquals("hello there", chatFilterService.censor("hello there"));
    }

    @Test
    public void messageUnchangedWhenNoWordMatches() {
        givenWords("darn");
        assertEquals("hello there", chatFilterService.censor("hello there"));
    }

    @Test
    public void replacesWordWithOneAsteriskPerCharacter() {
        givenWords("darn");
        assertEquals("oh **** it", chatFilterService.censor("oh darn it"));
    }

    @Test
    public void matchingIsCaseInsensitiveAndReplacesEveryOccurrence() {
        givenWords("darn");
        assertEquals("****, ****! ****?", chatFilterService.censor("DARN, Darn! darn?"));
    }

    @Test
    public void matchesAtStartAndEndOfMessage() {
        givenWords("darn");
        assertEquals("****", chatFilterService.censor("darn"));
    }

    @Test
    public void doesNotCensorWordsThatOnlyContainAFilteredWord() {
        givenWords("ass");
        assertEquals("my class passed, ***", chatFilterService.censor("my class passed, ass"));
        assertEquals("ass_hat ass1 1ass", chatFilterService.censor("ass_hat ass1 1ass"));
    }

    @Test
    public void handlesNonAsciiLettersAsPartOfAWord() {
        givenWords("ass");
        assertEquals("éass assé", chatFilterService.censor("éass assé"));
    }

    @Test
    public void handlesUnicodeCaseInsensitively() {
        givenWords("éclair");
        assertEquals("****** time", chatFilterService.censor("ÉCLAIR time"));
    }

    @Test
    public void regexCharactersInWordsAreTreatedLiterally() {
        givenWords("a.b");
        assertEquals("*** axb", chatFilterService.censor("a.b axb"));
    }

    @Test
    public void censorsMultipleDifferentWords() {
        givenWords("darn", "heck");
        assertEquals("**** and ****", chatFilterService.censor("darn and heck"));
    }

    @Test
    public void longerPhrasesAreCensoredBeforeShorterWords() {
        // "bad" is listed first; if it were applied first, "bad word" would no longer match
        givenWords("bad", "word", "bad word");
        assertEquals("******** but ***", chatFilterService.censor("bad word but bad"));
        givenWords("bad", "bad word");
        assertEquals("******** but ***, word", chatFilterService.censor("bad word but bad, word"));
    }
}
