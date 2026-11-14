import React from "react";
import AdminChatFilterWordsPage from "main/pages/AdminChatFilterWordsPage";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { chatFilterWordsFixtures } from "fixtures/chatFilterWordsFixtures";
import { http, HttpResponse } from "msw";

export default {
  title: "pages/AdminChatFilterWordsPage",
  component: AdminChatFilterWordsPage,
};

const commonHandlers = [
  http.get("/api/currentUser", () => {
    return HttpResponse.json(apiCurrentUserFixtures.adminUser, {
      status: 200,
    });
  }),
  http.get("/api/systemInfo", () => {
    return HttpResponse.json(systemInfoFixtures.showingNeither, {
      status: 200,
    });
  }),
];

export const Empty = () => <AdminChatFilterWordsPage />;
Empty.parameters = {
  msw: [
    ...commonHandlers,
    http.get("/api/chatfilterwords/all", () => {
      return HttpResponse.json([], { status: 200 });
    }),
  ],
};

export const ThreeWords = () => <AdminChatFilterWordsPage />;
ThreeWords.parameters = {
  msw: [
    ...commonHandlers,
    http.get("/api/chatfilterwords/all", () => {
      return HttpResponse.json(chatFilterWordsFixtures.threeWords, {
        status: 200,
      });
    }),
    http.post("/api/chatfilterwords", ({ request }) => {
      const word = new URL(request.url).searchParams.get("word");
      return HttpResponse.json(
        { id: 4, word: word.trim().toLowerCase() },
        { status: 200 },
      );
    }),
    http.delete("/api/chatfilterwords", () => {
      return HttpResponse.json(
        { message: "ChatFilterWord with id 1 deleted" },
        { status: 200 },
      );
    }),
  ],
};
