import React from "react";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import ChatFilterWordForm from "main/components/ChatFilterWords/ChatFilterWordForm";
import ChatFilterWordsTable from "main/components/ChatFilterWords/ChatFilterWordsTable";
import { useBackend, useBackendMutation } from "main/utils/useBackend";
import {
  onPostSuccess,
  wordToAxiosParamsPost,
} from "main/utils/chatFilterWordUtils";

export default function AdminChatFilterWordsPage() {
  // Stryker disable all
  const { data: words } = useBackend(
    ["/api/chatfilterwords/all"],
    { method: "GET", url: "/api/chatfilterwords/all" },
    [],
  );
  // Stryker restore all

  const addMutation = useBackendMutation(
    wordToAxiosParamsPost,
    { onSuccess: onPostSuccess },
    ["/api/chatfilterwords/all"],
  );

  const submitAction = (data, clearInput) => {
    addMutation.mutate(data, { onSuccess: clearInput });
  };

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Chat Filter Words</h1>
        <p>
          Words and phrases on this list will be censored with asterisks in game
          chat. Words are saved in lowercase.
        </p>
        <ChatFilterWordForm submitAction={submitAction} />
        <ChatFilterWordsTable words={words} />
      </div>
    </BasicLayout>
  );
}
