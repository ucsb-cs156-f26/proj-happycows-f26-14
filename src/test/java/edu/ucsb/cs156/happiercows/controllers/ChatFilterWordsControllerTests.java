package edu.ucsb.cs156.happiercows.controllers;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import edu.ucsb.cs156.happiercows.ControllerTestCase;
import edu.ucsb.cs156.happiercows.entities.ChatFilterWord;
import edu.ucsb.cs156.happiercows.repositories.ChatFilterWordRepository;
import edu.ucsb.cs156.happiercows.repositories.UserRepository;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MvcResult;

@WebMvcTest(controllers = ChatFilterWordsController.class)
public class ChatFilterWordsControllerTests extends ControllerTestCase {

    @MockBean
    ChatFilterWordRepository chatFilterWordRepository;

    @MockBean
    UserRepository userRepository;

    // GET /api/chatfilterwords/all

    @Test
    public void loggedOutUsersCannotListWords() throws Exception {
        mockMvc.perform(get("/api/chatfilterwords/all")).andExpect(status().is(403));
    }

    @WithMockUser(roles = { "USER" })
    @Test
    public void regularUsersCannotListWords() throws Exception {
        mockMvc.perform(get("/api/chatfilterwords/all")).andExpect(status().is(403));
    }

    @WithMockUser(roles = { "ADMIN", "USER" })
    @Test
    public void adminCanListWords() throws Exception {
        List<ChatFilterWord> words = List.of(
                ChatFilterWord.builder().id(1L).word("darn").build(),
                ChatFilterWord.builder().id(2L).word("heck").build());
        when(chatFilterWordRepository.findAll()).thenReturn(words);

        MvcResult response = mockMvc.perform(get("/api/chatfilterwords/all"))
                .andExpect(status().isOk()).andReturn();

        verify(chatFilterWordRepository, times(1)).findAll();
        assertEquals(mapper.writeValueAsString(words), response.getResponse().getContentAsString());
    }

    // POST /api/chatfilterwords

    @Test
    public void loggedOutUsersCannotAddWords() throws Exception {
        mockMvc.perform(post("/api/chatfilterwords?word=darn").with(csrf()))
                .andExpect(status().is(403));
        verify(chatFilterWordRepository, never()).save(any());
    }

    @WithMockUser(roles = { "USER" })
    @Test
    public void regularUsersCannotAddWords() throws Exception {
        mockMvc.perform(post("/api/chatfilterwords?word=darn").with(csrf()))
                .andExpect(status().is(403));
        verify(chatFilterWordRepository, never()).save(any());
    }

    @WithMockUser(roles = { "ADMIN", "USER" })
    @Test
    public void adminCanAddWordAndItIsTrimmedAndLowercased() throws Exception {
        ChatFilterWord saved = ChatFilterWord.builder().id(7L).word("darn").build();
        when(chatFilterWordRepository.findByWord("darn")).thenReturn(Optional.empty());
        when(chatFilterWordRepository.save(any(ChatFilterWord.class))).thenReturn(saved);

        MvcResult response = mockMvc.perform(post("/api/chatfilterwords").param("word", "  DaRn ").with(csrf()))
                .andExpect(status().isOk()).andReturn();

        ArgumentCaptor<ChatFilterWord> captor = ArgumentCaptor.forClass(ChatFilterWord.class);
        verify(chatFilterWordRepository, times(1)).save(captor.capture());
        assertEquals("darn", captor.getValue().getWord());
        assertEquals(mapper.writeValueAsString(saved), response.getResponse().getContentAsString());
    }

    @WithMockUser(roles = { "ADMIN", "USER" })
    @Test
    public void adminAddingPhraseCollapsesInternalWhitespace() throws Exception {
        when(chatFilterWordRepository.findByWord("bad word")).thenReturn(Optional.empty());
        when(chatFilterWordRepository.save(any(ChatFilterWord.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        mockMvc.perform(post("/api/chatfilterwords").param("word", " Bad \t  WORD ").with(csrf()))
                .andExpect(status().isOk());

        ArgumentCaptor<ChatFilterWord> captor = ArgumentCaptor.forClass(ChatFilterWord.class);
        verify(chatFilterWordRepository, times(1)).save(captor.capture());
        assertEquals("bad word", captor.getValue().getWord());
    }

    @WithMockUser(roles = { "ADMIN", "USER" })
    @Test
    public void lowercasingIgnoresDefaultLocale() throws Exception {
        Locale original = Locale.getDefault();
        try {
            // In a Turkish locale, "I".toLowerCase() is a dotless "ı", not "i".
            Locale.setDefault(Locale.forLanguageTag("tr"));
            when(chatFilterWordRepository.findByWord("idiot")).thenReturn(Optional.empty());
            when(chatFilterWordRepository.save(any(ChatFilterWord.class)))
                    .thenAnswer(invocation -> invocation.getArgument(0));

            mockMvc.perform(post("/api/chatfilterwords").param("word", "IDIOT").with(csrf()))
                    .andExpect(status().isOk());

            ArgumentCaptor<ChatFilterWord> captor = ArgumentCaptor.forClass(ChatFilterWord.class);
            verify(chatFilterWordRepository, times(1)).save(captor.capture());
            assertEquals("idiot", captor.getValue().getWord());
        } finally {
            Locale.setDefault(original);
        }
    }

    @WithMockUser(roles = { "ADMIN", "USER" })
    @Test
    public void adminCanAddWordOfMaxLength() throws Exception {
        String word = "a".repeat(255);
        when(chatFilterWordRepository.findByWord(word)).thenReturn(Optional.empty());
        when(chatFilterWordRepository.save(any(ChatFilterWord.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        mockMvc.perform(post("/api/chatfilterwords").param("word", word).with(csrf()))
                .andExpect(status().isOk());

        verify(chatFilterWordRepository, times(1)).save(any());
    }

    @WithMockUser(roles = { "ADMIN", "USER" })
    @Test
    public void adminCannotAddWordOverMaxLength() throws Exception {
        MvcResult response = mockMvc.perform(post("/api/chatfilterwords").param("word", "a".repeat(256)).with(csrf()))
                .andExpect(status().isBadRequest()).andReturn();

        verify(chatFilterWordRepository, never()).save(any());
        assertEquals(Map.of("message", "Word must be at most 255 characters"), responseToJson(response));
    }

    @WithMockUser(roles = { "ADMIN", "USER" })
    @Test
    public void adminCannotAddBlankWord() throws Exception {
        MvcResult response = mockMvc.perform(post("/api/chatfilterwords").param("word", "   ").with(csrf()))
                .andExpect(status().isBadRequest()).andReturn();

        verify(chatFilterWordRepository, never()).save(any());
        assertEquals(Map.of("message", "Word must not be blank"), responseToJson(response));
    }

    @WithMockUser(roles = { "ADMIN", "USER" })
    @Test
    public void adminCannotAddDuplicateWord() throws Exception {
        when(chatFilterWordRepository.findByWord("darn"))
                .thenReturn(Optional.of(ChatFilterWord.builder().id(1L).word("darn").build()));

        MvcResult response = mockMvc.perform(post("/api/chatfilterwords").param("word", "Darn").with(csrf()))
                .andExpect(status().isConflict()).andReturn();

        verify(chatFilterWordRepository, never()).save(any());
        assertEquals(Map.of("message", "\"darn\" is already on the list"), responseToJson(response));
    }

    // DELETE /api/chatfilterwords

    @Test
    public void loggedOutUsersCannotDeleteWords() throws Exception {
        mockMvc.perform(delete("/api/chatfilterwords?id=1").with(csrf()))
                .andExpect(status().is(403));
        verify(chatFilterWordRepository, never()).delete(any());
    }

    @WithMockUser(roles = { "USER" })
    @Test
    public void regularUsersCannotDeleteWords() throws Exception {
        mockMvc.perform(delete("/api/chatfilterwords?id=1").with(csrf()))
                .andExpect(status().is(403));
        verify(chatFilterWordRepository, never()).delete(any());
    }

    @WithMockUser(roles = { "ADMIN", "USER" })
    @Test
    public void adminCanDeleteWord() throws Exception {
        ChatFilterWord word = ChatFilterWord.builder().id(15L).word("darn").build();
        when(chatFilterWordRepository.findById(15L)).thenReturn(Optional.of(word));

        MvcResult response = mockMvc.perform(delete("/api/chatfilterwords?id=15").with(csrf()))
                .andExpect(status().isOk()).andReturn();

        verify(chatFilterWordRepository, times(1)).delete(word);
        assertEquals(Map.of("message", "ChatFilterWord with id 15 deleted"), responseToJson(response));
    }

    @WithMockUser(roles = { "ADMIN", "USER" })
    @Test
    public void adminDeletingMissingWordGets404() throws Exception {
        when(chatFilterWordRepository.findById(15L)).thenReturn(Optional.empty());

        MvcResult response = mockMvc.perform(delete("/api/chatfilterwords?id=15").with(csrf()))
                .andExpect(status().isNotFound()).andReturn();

        verify(chatFilterWordRepository, never()).delete(any());
        assertEquals("ChatFilterWord with id 15 not found", responseToJson(response).get("message"));
    }
}
