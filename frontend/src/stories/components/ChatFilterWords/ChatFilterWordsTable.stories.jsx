import React from "react";
import ChatFilterWordsTable from "main/components/ChatFilterWords/ChatFilterWordsTable";
import { chatFilterWordsFixtures } from "fixtures/chatFilterWordsFixtures";
import { http, HttpResponse } from "msw";

export default {
  title: "components/ChatFilterWords/ChatFilterWordsTable",
  component: ChatFilterWordsTable,
};

const Template = (args) => <ChatFilterWordsTable {...args} />;

export const Empty = Template.bind({});
Empty.args = {
  words: [],
};

export const ThreeWords = Template.bind({});
ThreeWords.args = {
  words: chatFilterWordsFixtures.threeWords,
};
ThreeWords.parameters = {
  msw: [
    http.delete("/api/chatfilterwords", () => {
      return HttpResponse.json(
        { message: "ChatFilterWord with id 1 deleted" },
        { status: 200 },
      );
    }),
  ],
};
