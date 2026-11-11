import React from "react";
import AdminChatFilterPage from "main/pages/AdminChatFilterPage";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { chatFilterWordsFixtures } from "fixtures/chatFilterWordsFixtures";
import { http, HttpResponse } from "msw";

export default {
  title: "pages/AdminChatFilterPage",
  component: AdminChatFilterPage,
};

const commonHandlers = [
  http.get("/api/currentUser", () =>
    HttpResponse.json(apiCurrentUserFixtures.adminUser, { status: 200 }),
  ),
  http.get("/api/systemInfo", () =>
    HttpResponse.json(systemInfoFixtures.showingNeither, { status: 200 }),
  ),
];

export const Empty = () => <AdminChatFilterPage />;
Empty.parameters = {
  msw: [
    ...commonHandlers,
    http.get("/api/chatfilterwords/all", () =>
      HttpResponse.json([], { status: 200 }),
    ),
  ],
};

export const ThreeWords = () => <AdminChatFilterPage />;
ThreeWords.parameters = {
  msw: [
    ...commonHandlers,
    http.get("/api/chatfilterwords/all", () =>
      HttpResponse.json(chatFilterWordsFixtures.threeWords, { status: 200 }),
    ),
    http.post("/api/chatfilterwords", ({ request }) => {
      const word = new URL(request.url).searchParams.get("word");
      return HttpResponse.json({ id: 4, word }, { status: 200 });
    }),
    http.delete("/api/chatfilterwords", ({ request }) => {
      const id = new URL(request.url).searchParams.get("id");
      return HttpResponse.json(
        { message: `ChatFilterWord with id ${id} deleted` },
        { status: 200 },
      );
    }),
  ],
};
