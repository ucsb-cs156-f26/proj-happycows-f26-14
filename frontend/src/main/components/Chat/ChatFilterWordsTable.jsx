import React from "react";
import OurTable, { ButtonColumn } from "main/components/OurTable";
import { useBackendMutation } from "main/utils/useBackend";
import { toast } from "react-toastify";
import { cellToAxiosParamsDelete } from "main/utils/chatFilterUtils";

export default function ChatFilterWordsTable({
  words,
  testid = "ChatFilterWordsTable",
}) {
  const deleteMutation = useBackendMutation(
    cellToAxiosParamsDelete,
    { onSuccess: (response) => toast(response.message) },
    // Stryker disable next-line all : hard to set up test for caching
    ["/api/chatfilterwords/all"],
  );

  const deleteCallback = (cell) => deleteMutation.mutate(cell);

  const columns = [
    { Header: "id", accessor: "id" },
    { Header: "Word", accessor: "word" },
    ButtonColumn("Delete", "danger", deleteCallback, testid),
  ];

  return <OurTable data={words} columns={columns} testid={testid} />;
}
