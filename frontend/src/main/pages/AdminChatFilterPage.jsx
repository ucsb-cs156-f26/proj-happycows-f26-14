import React from "react";
import { Button, Form, InputGroup } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import ChatFilterWordsTable from "main/components/Chat/ChatFilterWordsTable";
import { useBackend, useBackendMutation } from "main/utils/useBackend";
import { wordToAxiosParamsPost } from "main/utils/chatFilterUtils";

const testIdPrefix = "AdminChatFilterPage";

export default function AdminChatFilterPage() {
  // Stryker disable all
  const { data: words } = useBackend(
    ["/api/chatfilterwords/all"],
    { method: "GET", url: "/api/chatfilterwords/all" },
    [],
  );

  const {
    register,
    reset,
    formState: { errors },
    handleSubmit,
  } = useForm({ defaultValues: { word: "" } });
  // Stryker restore all

  const addMutation = useBackendMutation(
    wordToAxiosParamsPost,
    {
      onSuccess: (saved) => {
        toast(`Added "${saved.word}" to the chat filter`);
        reset();
      },
    },
    // Stryker disable next-line all : hard to set up test for caching
    ["/api/chatfilterwords/all"],
  );

  const onSubmit = (data) => addMutation.mutate(data.word);

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Chat Filter</h1>
        <p>
          Words and phrases on this list are replaced with asterisks whenever
          they appear in a chat message. Matching ignores case and only matches
          whole words, so filtering "ass" won't censor "class".
        </p>
        <Form onSubmit={handleSubmit(onSubmit)} className="mb-3">
          <Form.Label htmlFor="word">Add a word or phrase</Form.Label>
          <InputGroup hasValidation>
            <Form.Control
              data-testid={`${testIdPrefix}-word`}
              id="word"
              type="text"
              isInvalid={Boolean(errors.word)}
              {...register("word", {
                validate: (value) => value.trim() !== "" || "Word is required.",
              })}
            />
            <Button type="submit" data-testid={`${testIdPrefix}-submit`}>
              Add Word
            </Button>
            <Form.Control.Feedback type="invalid">
              {errors.word?.message}
            </Form.Control.Feedback>
          </InputGroup>
        </Form>
        <ChatFilterWordsTable words={words} />
      </div>
    </BasicLayout>
  );
}
